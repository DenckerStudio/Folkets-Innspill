import type { CardValidationResult, SakContext, SummaryCard } from './types';

const SIGNIFICANT_WORD_MIN_LEN = 4;

function significantWords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length >= SIGNIFICANT_WORD_MIN_LEN)
  );
}

export function wordOverlapRatio(a: string, b: string): number {
  const wa = significantWords(a);
  const wb = significantWords(b);
  if (wa.size === 0 || wb.size === 0) return 0;
  let shared = 0;
  for (const w of wa) {
    if (wb.has(w)) shared += 1;
  }
  return shared / Math.min(wa.size, wb.size);
}

export function cardsAreRepetitive(cards: SummaryCard[]): boolean {
  for (let i = 0; i < cards.length; i += 1) {
    for (let j = i + 1; j < cards.length; j += 1) {
      if (wordOverlapRatio(cards[i].body, cards[j].body) > 0.42) return true;
    }
    if (wordOverlapRatio(cards[i].body, cards[i].title) > 0.72) return true;
  }
  return false;
}

function bodyMostlyRepeatsTitle(card: SummaryCard): boolean {
  return wordOverlapRatio(card.body, card.title) > 0.65;
}

/** Faste fallback-id/titler som ikke skal godkjennes som ferdig sammendrag. */
export const GENERIC_FALLBACK_IDS = new Set([
  'hovedinnhold',
  'berorte-grupper',
  'okonomi',
]);

const GENERIC_TITLE_PATTERNS = [
  /^hva saken gjelder$/i,
  /^hvem som påvirkes$/i,
  /^økonomiske konsekvenser$/i,
  /^hva det handler om$/i,
  /^berørte grupper$/i,
];

const PLACEHOLDER_BODY_PATTERNS = [
  /ingen spesifikke berørte grupper/i,
  /ingen kostnader omtalt/i,
  /ikke tydelig omtalt i tilgjengelig kildetekst/i,
  /ingen konkrete grupper er nevnt/i,
  /mangler tilstrekkelig grunnlag/i,
];

export function isGenericTitle(title: string): boolean {
  const t = title.trim();
  return GENERIC_TITLE_PATTERNS.some((p) => p.test(t));
}

export function isPlaceholderBody(body: string): boolean {
  const b = body.trim();
  if (b.length < 40) return true;
  return PLACEHOLDER_BODY_PATTERNS.some((p) => p.test(b));
}

export function isGenericFallbackCard(card: SummaryCard): boolean {
  if (GENERIC_FALLBACK_IDS.has(card.id)) return true;
  return isGenericTitle(card.title) && isPlaceholderBody(card.body);
}

export function isLowValueCard(
  card: SummaryCard,
  siblings: SummaryCard[] = []
): boolean {
  if (isPlaceholderBody(card.body)) return true;
  if (isGenericTitle(card.title) && card.body.length < 120) return true;
  if (bodyMostlyRepeatsTitle(card)) return true;
  if (siblings.some((s) => s.id !== card.id && wordOverlapRatio(s.body, card.body) > 0.42)) {
    return true;
  }
  return false;
}

function bodySharesSourceTerms(body: string, ctx: SakContext): boolean {
  const source = [
    ctx.title,
    ctx.innstillingstekst,
    ctx.kortvedtak,
    ctx.vedtakstekst,
    ctx.documentExcerpts,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (!source) return false;

  const words = body
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length >= 5);
  if (words.length === 0) return false;

  const hits = words.filter((w) => source.includes(w));
  return hits.length >= 2;
}

/**
 * Regelbasert validering når LLM-validering er av (Ollama) eller som ekstra sperre.
 */
export function heuristicValidateCard(
  ctx: SakContext,
  card: SummaryCard,
  siblings: SummaryCard[] = []
): CardValidationResult {
  let score = 72;
  const missing: string[] = [];
  let feedback = '';

  if (isPlaceholderBody(card.body)) {
    score = 25;
    feedback =
      'Teksten sier bare at noe «ikke er omtalt». Skriv heller hva kilden faktisk sier om dette aspektet, eller velg et annet aspekt fra saken.';
    missing.push('Konkret innhold fra kilden');
  }

  if (isGenericTitle(card.title)) {
    score = Math.min(score, 40);
    feedback =
      feedback ||
      'Tittelen er for generisk. Bruk en kort tittel hentet fra sakens innhold (institusjon, tema, vedtak).';
    missing.push('Saksspesifikk tittel');
  }

  if (GENERIC_FALLBACK_IDS.has(card.id) && isGenericTitle(card.title)) {
    score = Math.min(score, 30);
  }

  if (card.body.length < 60) {
    score = Math.min(score, 45);
    missing.push('Mer utfyllende forklaring (2–3 setninger)');
  }

  if (!bodySharesSourceTerms(card.body, ctx)) {
    score = Math.min(score, 55);
    missing.push('Ord og begreper fra kildeteksten');
    if (!feedback) {
      feedback =
        'Kortet virker løsrevet fra kilden. Bruk begreper og formuleringer som faktisk står i innstilling eller dokumenter.';
    }
  }

  const otherBodies = siblings.filter((s) => s.id !== card.id);
  if (otherBodies.some((s) => wordOverlapRatio(s.body, card.body) > 0.42)) {
    score = Math.min(score, 35);
    feedback =
      feedback ||
      'Kortet gjentar andre kort. Skriv om et annet aspekt (innhold, betydning for folk, eller detalj fra kilden).';
    missing.push('Unikt innhold som ikke gjentas i andre kort');
  }

  if (bodyMostlyRepeatsTitle(card)) {
    score = Math.min(score, 40);
    feedback =
      feedback ||
      'Teksten gjentar bare tittelen. Forklar konkret hva som endres eller behandles.';
    missing.push('Utfyllende forklaring utover sakstittel');
  }

  const approved = score >= 70 && !isLowValueCard(card, siblings);

  return {
    cardId: card.id,
    approved,
    score,
    feedback: feedback || (approved ? '' : 'Dekker ikke kilden godt nok.'),
    missingAspects: missing,
  };
}

export function applyQualityGuard(
  ctx: SakContext,
  card: SummaryCard,
  validation: CardValidationResult,
  siblings: SummaryCard[] = []
): CardValidationResult {
  if (!validation.approved) return validation;

  const heuristic = heuristicValidateCard(ctx, card, siblings);
  if (heuristic.approved) return validation;

  return {
    ...validation,
    approved: false,
    score: Math.min(validation.score, heuristic.score),
    feedback: heuristic.feedback || validation.feedback,
    missingAspects: [
      ...new Set([...validation.missingAspects, ...heuristic.missingAspects]),
    ],
  };
}

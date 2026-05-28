import { buildSakContextText } from './context';
import { SUMMARY_CARD_ROLES } from './card-roles';
import { wordOverlapRatio } from './card-quality';
import type { SakContext, SummaryCard } from './types';

function truncate(text: string, max = 400): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 35);
}

function titleCaseShort(phrase: string, maxWords = 7): string {
  const words = phrase.trim().split(/\s+/).slice(0, maxWords);
  const t = words.join(' ');
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function extractSubjectFromTitle(title: string): string | null {
  const om = title.match(/\bom\s+(.+)$/i);
  if (om?.[1] && om[1].length >= 10) {
    return om[1].replace(/\s+for\s+\d{4}\s*$/i, '').trim();
  }
  const omEndringer = title.match(/endringer?\s+i\s+(.+)$/i);
  if (omEndringer?.[1]) return omEndringer[1].trim();
  return null;
}

function pickDistinctSentences(
  sentences: string[],
  count: number,
  avoidBodies: string[] = []
): string[] {
  const picked: string[] = [];
  for (const s of sentences) {
    if (avoidBodies.some((a) => wordOverlapRatio(a, s) > 0.35)) continue;
    if (picked.some((p) => wordOverlapRatio(p, s) > 0.45)) continue;
    picked.push(s);
    if (picked.length >= count) break;
  }
  return picked;
}

function detailTitleFromText(sentence: string): string {
  if (/frist/i.test(sentence)) return 'Frister og saksbehandling';
  if (/debatt|avstemning/i.test(sentence)) return 'Debatt og avstemning';
  if (/kapittel|paragraf|§/i.test(sentence)) return 'Regelverk som endres';
  return 'Viktig detalj fra innstillingen';
}

function primarySourceText(ctx: SakContext): string {
  return [
    ctx.innstillingstekst,
    ctx.vedtakstekst,
    ctx.kortvedtak,
    ctx.documentExcerpts,
    ctx.parentestekst,
    ctx.summary,
  ]
    .filter(Boolean)
    .join('\n\n');
}

function buildSubstanceBody(ctx: SakContext, sentences: string[]): string {
  const titleSnippet = ctx.title.slice(0, 40).toLowerCase();
  const picked = pickDistinctSentences(sentences, 1, [titleSnippet]);
  if (picked.length >= 1) {
    return truncate(picked.join(' '));
  }
  const subject = extractSubjectFromTitle(ctx.title);
  if (subject) {
    return truncate(
      `Stortinget behandler ${subject}. ${ctx.summary}`.replace(/\s+/g, ' ')
    );
  }
  return truncate(
    `Stortinget behandler: ${ctx.title}. ${firstLine(ctx.summary)}`
  );
}

function firstLine(text: string): string {
  return text.split(/(?<=[.!?])\s+/)[0] ?? text;
}

function buildCitizenImpactBody(ctx: SakContext, source: string): string {
  const blob = `${ctx.title} ${source} ${ctx.category ?? ''}`.toLowerCase();

  if (/forretningsorden|debattregler|møteorden|valg av/.test(blob)) {
    return truncate(
      'Reglene for hvordan Stortinget jobber styrer tempo, åpenhet og mulighet for opposisjonen til å påvirke lover. Endringer kan derfor påvirke hvordan demokratiske beslutninger blir til – noe velgere og journalister følger med på, selv om de fleste ikke deltar direkte i saken.'
    );
  }
  if (/lov|forskrift|straff|skatt|avgift|ytelse|stønad|pensjon|helse|skole/.test(blob)) {
    return truncate(
      'Lov- og regelendringer kan endre rettigheter, plikter eller offentlige tjenester som mange nordmenn bruker i hverdagen. Det konkrete utslaget avhenger av hva som faktisk vedtas i teksten.'
    );
  }
  if (/budsjett|bevilg|økonomi|avgift/.test(blob)) {
    return truncate(
      'Statsbudsjett og bevilgninger fordeler felles midler til helse, skole, infrastruktur og annet. Endringer kan påvirke tjenestenivå og skatt over tid, avhengig av vedtakene.'
    );
  }
  if (/rapport|orientering|årsrapport|representantskap/.test(blob)) {
    return truncate(
      'Selv om slike saker ofte er orientering uten direkte lovendring, kan rapporten påvirke pengepolitikk, regulering eller offentlig debatt – med ringvirkninger for økonomi og arbeidsmarked folk merker over tid.'
    );
  }

  return truncate(
    'Stortinget behandler saken på vegne av velgerne. Utfallet kan endre offentlige rammer eller praksis som påvirker innbyggere, avhengig av hva som vedtas – sjekk innstilling og dokumenter for det konkrete innholdet.'
  );
}

function buildDetailBody(
  ctx: SakContext,
  sentences: string[],
  usedBodies: string[]
): { body: string; title: string } {
  const picked = pickDistinctSentences(sentences, 1, usedBodies);
  if (picked[0]) {
    return {
      body: truncate(picked[0]),
      title: detailTitleFromText(picked[0]),
    };
  }

  if (ctx.komite) {
    return {
      body: truncate(
        `${ctx.komite} har forberedt saken for Stortinget. Behandlingen følger vanlig stortingsprosess med debatt og avstemning.`
      ),
      title: 'Behandling i Stortinget',
    };
  }
  if (ctx.sakTypeLabel) {
    return {
      body: truncate(
        `Saken er en ${ctx.sakTypeLabel.toLowerCase()}. Den behandles etter Stortingets ordinære regler før eventuelt vedtak.`
      ),
      title: 'Saksprosess',
    };
  }
  return {
    body: truncate(
      'Saken ligger til behandling i Stortinget. Utfallet avgjøres når representantene stemmer over innstillingen.'
    ),
    title: 'Vedtak og avstemning',
  };
}

function topicTitle(ctx: SakContext): string {
  const subject = extractSubjectFromTitle(ctx.title);
  if (subject) return titleCaseShort(subject, 8);
  const short = ctx.title.split(/[,.]/)[0]?.trim();
  return truncate(short ?? 'Sakens innhold', 72);
}

/**
 * Regelbaserte kort når LLM feiler – tre ulike vinkler uten å gjenta sakstittelen.
 */
export function buildFallbackCards(ctx: SakContext): SummaryCard[] {
  const source = buildSakContextText(ctx, { maxChars: 10_000 });
  const sentences = splitSentences(primarySourceText(ctx));
  const substance = buildSubstanceBody(ctx, sentences);
  const citizen = buildCitizenImpactBody(ctx, source);
  const detail = buildDetailBody(ctx, sentences, [substance, citizen]);

  const cards: SummaryCard[] = [
    {
      id: SUMMARY_CARD_ROLES[0].id,
      title: topicTitle(ctx),
      hint: SUMMARY_CARD_ROLES[0].hint,
      body: substance,
    },
    {
      id: SUMMARY_CARD_ROLES[1].id,
      title: SUMMARY_CARD_ROLES[1].defaultTitle,
      hint: SUMMARY_CARD_ROLES[1].hint,
      body: citizen,
    },
    {
      id: SUMMARY_CARD_ROLES[2].id,
      title: detail.title,
      hint: SUMMARY_CARD_ROLES[2].hint,
      body: detail.body,
    },
  ];

  return cards;
}

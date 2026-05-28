/** Detekterer om «hvem»-tekst feilaktig beskriver forslagstillere/komité i stedet for berørte. */

const PROPOSER_PATTERNS = [
  /\bforslag\s+fra\b/i,
  /\bforslagstillere?\b/i,
  /\bkomité\s*:/i,
  /\bkomiteen\b.*\bforslag\b/i,
  /\brepresentant(?:er|forslag)?\b/i,
  /\bfrp\b|\bhøyre\b|\bap\b|\bsv\b|\bsp\b|\bmdg\b|\brødt\b/i,
];

const AFFECTED_KEYWORDS =
  /\b(pasient|borgere?|innbygg|kommune|næring|bransje|produsent|apotek|sykehus|helsevesen|virksomhet|etat|grossist|industri|arbeidsgiver|ansatte|eldre|barn|unge|forsikringstaker|skattebetaler|forbruker|lokalavdeling|region)\b/i;

export function isProposerOnlyHvemAnswer(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  const hasProposerSignal = PROPOSER_PATTERNS.some((p) => p.test(trimmed));
  if (!hasProposerSignal) return false;

  if (AFFECTED_KEYWORDS.test(trimmed)) {
    const proposerHeavy =
      /\bkomité\s*:/i.test(trimmed) && /\bforslag\s+fra\b/i.test(trimmed);
    return proposerHeavy && !/(pasient|borgere?|produsent|apotek|næring|bransje)/i.test(trimmed);
  }

  return true;
}

export function hvemRejectionFeedback(): string {
  return 'Teksten beskriver forslagstillere eller komité, ikke hvem som påvirkes av saken. Nevn berørte grupper (f.eks. pasienter, næringer, kommuner) fra innstilling eller vedtak.';
}

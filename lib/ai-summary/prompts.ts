import type { SummaryField, SummaryCards } from './types';

const FIELD_GUIDANCE: Record<SummaryField, string> = {
  hva: `Forklar hva saken handler om i klart, nøytralt språk.
- Ta utgangspunkt i tittel, innstilling og vedtakstekst.
- Nevn hovedmålet (forslag, endring, vedtak) uten partipolitisk vinkling.
- 2–3 korte setninger. Ingen overskrifter eller punktlister.`,
  hvem: `Beskriv hvem som påvirkes direkte av saken.
- Nevn konkrete grupper (borgere, næringer, kommuner, etater) som fremgår av kildematerialet.
- Skill mellom direkte og indirekte berørte hvis det er relevant.
- 2–3 korte setninger. Ikke spekuler om grupper som ikke nevnes i saken.`,
  kostnad: `Beskriv økonomiske konsekvenser eller kostnader knyttet til saken.
- Bruk tall og beløp kun hvis de står eksplisitt i kildematerialet; ellers skriv at konkrete beløp ikke er oppgitt.
- Nevn om kostnaden gjelder stat, kommune, næringsliv eller innbyggere når det fremgår.
- 2–3 korte setninger. Ikke finn på kroner eller prosenter.`,
};

export function buildInitialGenerationPrompt(sakContextText: string): string {
  return `Du er en nøytral, faktabasert assistent for "Folkets Stemme" som forenkler stortingssaker for vanlige borgere.

KILDE (stortingssak – bruk kun dette som grunnlag):
---
${sakContextText}
---

Oppgave: Lag tre korte forklaringer på norsk. Hver skal være selvstendig lesbar og forankret i kildematerialet.

${FIELD_GUIDANCE.hva}

${FIELD_GUIDANCE.hvem}

${FIELD_GUIDANCE.kostnad}

Svar KUN med gyldig JSON uten markdown:
{"hva":"...","hvem":"...","kostnad":"..."}`;
}

export function buildFieldRegenerationPrompt(
  field: SummaryField,
  sakContextText: string,
  current: SummaryCards,
  feedback: string,
  missingAspects: string[]
): string {
  const missing =
    missingAspects.length > 0
      ? `\nMangler i forrige forsøk: ${missingAspects.join('; ')}`
      : '';

  return `Du er en nøytral, faktabasert assistent for "Folkets Stemme".

KILDE (stortingssak):
---
${sakContextText}
---

Godkjente felt (ikke endre disse):
- hva: ${current.hva}
- hvem: ${current.hvem}
- kostnad: ${current.kostnad}

Feltet "${field}" ble ikke godkjent.
Tilbakemelding fra kvalitetskontroll: ${feedback}${missing}

${FIELD_GUIDANCE[field]}

Skriv kun på nytt feltet "${field}". Svar KUN med gyldig JSON:
{"${field}":"..."}`;
}

export function buildValidationPrompt(
  field: SummaryField,
  sakContextText: string,
  value: string
): string {
  const criteria: Record<SummaryField, string> = {
    hva: 'dekker hovedinnholdet i saken, er faktabasert, og unngår vage formuleringer',
    hvem: 'nevner relevante berørte parter fra kilden, uten å finne på nye grupper',
    kostnad:
      'beskriver økonomiske konsekvenser ærlig; tall kun hvis de finnes i kilden, ellers tydelig at beløp mangler',
  };

  return `Du er en streng kvalitetskontrollør for AI-sammendrag av stortingssaker.

KILDE:
---
${sakContextText}
---

Felt som skal vurderes: "${field}"
Tekst: "${value}"

Godkjenn KUN hvis teksten ${criteria[field]}, er på norsk, maks 3 setninger, og ikke inneholder hallusinerte fakta.

Svar KUN med gyldig JSON:
{
  "approved": true eller false,
  "score": tall 0-100,
  "feedback": "kort, konkret tilbakemelding på norsk hvis ikke godkjent",
  "missingAspects": ["liste med det som mangler i forhold til kilden"]
}`;
}

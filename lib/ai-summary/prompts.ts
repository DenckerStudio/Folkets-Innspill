import type { SummaryField, SummaryCards } from './types';

const FIELD_GUIDANCE: Record<SummaryField, string> = {
  hva: `Felt "hva" – hva saken handler om:
- Identifiser sakstype (f.eks. lovendring, budsjett, høring, stortingsmelding) hvis det fremgår av kilden.
- Forklar hovedforslaget, innstillingen eller vedtaket i 2–3 korte setninger.
- Ta utgangspunkt i tittel, innstillingstekst og vedtakstekst.
- Unngå vage åpninger som bare sier «saken handler om …» uten konkret innhold.
- Ikke partipolitisk vinkling. Maks 3 setninger, maks ca. 350 tegn.`,
  hvem: `Felt "hvem" – hvem som påvirkes:
- Nevn minst én konkret gruppe som fremgår av kilden (borgere, næringer, kommuner, etater, bransjer).
- Skill mellom direkte og indirekte berørte når kilden gjør det.
- Hvis kilden ikke nevner konkrete grupper: skriv eksplisitt at ingen spesifikke grupper er nevnt.
- Ikke finn på grupper som ikke står i saken. Maks 3 setninger, maks ca. 350 tegn.`,
  kostnad: `Felt "kostnad" – økonomiske konsekvenser:
- Bruk ett av disse mønstrene der det passer:
  • «Beløp: …» når tall står eksplisitt i kilden.
  • «Økonomisk effekt omtalt uten konkrete beløp» når kostnad nevnes uten tall.
  • «Ingen kostnader omtalt i kilden» når økonomi ikke er dekket.
- Nevn hvem som bærer kostnaden (stat, kommune, næring, innbyggere) når det fremgår.
- Ikke estimer eller finn på kroner eller prosenter. Maks 3 setninger, maks ca. 350 tegn.`,
};

const LANGUAGE_RULES = `SPRÅK (obligatorisk):
- Skriv utelukkende på norsk (bokmål).
- Bruk korte, tydelige setninger og vanlige ord. Forklar faguttrykk første gang.
- Vær saklig og nøytral. Ikke ta stilling til om forslaget er bra eller dårlig.
- Bygg kun på kilden. Ikke finn på tall, navn eller konsekvenser som ikke står der.
- Pek på hvilken del av kilden informasjonen bygger på (innstilling, vedtak, kortvedtak) uten å sitere verbatim.`;

export function buildInitialGenerationPrompt(sakContextText: string): string {
  return `Du er en nøytral, faktabasert assistent for «Folkets Stemme» som forenkler stortingssaker for vanlige borgere.

${LANGUAGE_RULES}

KILDE (stortingssak – bruk kun dette som grunnlag):
---
${sakContextText}
---

Oppgave: Lag tre korte, uavhengige forklaringer. Hvert felt skal ha eget innhold – ikke gjenta samme setning på tvers av hva, hvem og kostnad.

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
      ? `\nAlt som har manglet i tidligere forsøk (må adresseres): ${missingAspects.join('; ')}`
      : '';

  const otherFields = (['hva', 'hvem', 'kostnad'] as SummaryField[])
    .filter((f) => f !== field)
    .map((f) => `- ${f}: ${current[f]}`)
    .join('\n');

  return `Du er en nøytral, faktabasert assistent for «Folkets Stemme».

KILDE (stortingssak):
---
${sakContextText}
---

Godkjente felt (ikke endre disse):
${otherFields}

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
  const rubrics: Record<SummaryField, string> = {
    hva: `Sjekkliste for "hva":
- Nevner sakstype eller hovedinnhold fra kilden
- Er faktabasert og konkret (ikke vag)
- Dekker hovedforslag/innstilling/vedtak der det finnes i kilden
- Maks 3 setninger, norsk bokmål, ingen hallusinerte fakta`,
    hvem: `Sjekkliste for "hvem":
- Nevner relevante berørte parter fra kilden ELLER sier tydelig at ingen spesifikke grupper er nevnt
- Finner ikke opp nye grupper
- Skill direkte/indirekte berørte hvis relevant
- Maks 3 setninger, norsk bokmål`,
    kostnad: `Sjekkliste for "kostnad":
- Følger ett av mønstrene: Beløp / effekt uten tall / ingen kostnader omtalt
- Tall kun hvis de står i kilden
- Beskriver hvem som bærer kostnaden når kilden sier det
- Maks 3 setninger, norsk bokmål, ingen estimater`,
  };

  return `Du er en streng kvalitetskontrollør for AI-sammendrag av stortingssaker.

KILDE:
---
${sakContextText}
---

Felt som skal vurderes: "${field}"
Tekst: "${value}"

${rubrics[field]}

Godkjenn KUN hvis teksten oppfyller sjekklisten og dekker det viktigste fra kilden for dette feltet.

Svar KUN med gyldig JSON:
{
  "approved": true eller false,
  "score": tall 0-100,
  "feedback": "kort, konkret tilbakemelding på norsk hvis ikke godkjent",
  "missingAspects": ["liste med det som mangler i forhold til kilden"]
}`;
}

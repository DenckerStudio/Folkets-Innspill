import { SUMMARY_CARD_ROLES } from './card-roles';
import type { SakContext, SummaryCard } from './types';

const LANGUAGE_RULES = `SPRÅK (obligatorisk):
- Skriv UTELUKKENDE på norsk (bokmål). Ingen engelske ord unødvendig.
- Korte, tydelige setninger. Saklig og nøytral tone.
- Bygg på kilden. Ikke finn på tall, navn eller konsekvenser som ikke står der.`;

const BANNED_GENERIC_TITLES = `FORBUDTE TITLER (bruk aldri som title):
- «Hva saken gjelder», «Hvem som påvirkes», «Økonomiske konsekvenser», «Stortingssak» (alene)
- Titler skal være korte og hentet fra sakens faktiske innhold.`;

const CITIZEN_AND_DEPTH = `OBLIGATORISKE VINKLER (ett kort per vinkling):
1. Hva saken handler om – konkret og utdypende (ikke bare gjenta tittelen).
2. Hva det kan bety for en vanlig nordmann – direkte eller ærlig indirekte.
3. Et annet faktum fra kilden (prosess, vedtak, detalj) uten å gjenta kort 1 og 2.`;

function otherCardsBlock(otherCards: SummaryCard[]): string {
  if (otherCards.length === 0) return '';
  const lines = otherCards.map(
    (c) => `- [${c.id}] ${c.title}: ${c.body.slice(0, 200)}…`
  );
  return `\nKORT SOM ALLEREDE ER SKREVET (ikke gjenta ordlyd eller poeng):\n${lines.join('\n')}\n`;
}

export function buildSingleRoleCardPrompt(
  sakContextText: string,
  ctx: SakContext,
  roleIndex: number,
  otherCards: SummaryCard[] = []
): string {
  const role = SUMMARY_CARD_ROLES[roleIndex];
  if (!role) throw new Error(`Ugyldig kortrolle: ${roleIndex}`);

  return `Du er en nøytral assistent for «Folkets Stemme» som forklarer stortingssaker for vanlige borgere.

${LANGUAGE_RULES}

${BANNED_GENERIC_TITLES}

${ctx.sakTypeLabel ? `Sakstype: ${ctx.sakTypeLabel}` : ''}

KILDE:
---
${sakContextText}
---
${otherCardsBlock(otherCards)}

Oppgave – skriv ETT kort:
- id: "${role.id}" (uendret)
- title: kort saksspesifikk overskrift på norsk (3–8 ord)
- hint: "${role.hint}"
- body: 2–3 setninger, maks ca. 450 tegn

${role.instruction}

Svar med gyldig JSON: { "card": { "id", "title", "hint", "body" } }`;
}

export function buildDynamicCardsPrompt(
  sakContextText: string,
  ctx: SakContext,
  compact = false
): string {
  const sakType = ctx.sakTypeLabel ? `Sakstype: ${ctx.sakTypeLabel}` : '';
  const rolesList = SUMMARY_CARD_ROLES.map(
    (r, i) => `${i + 1}. id="${r.id}" – ${r.instruction.split('\n')[0]}`
  ).join('\n');

  return `Du er en nøytral assistent for «Folkets Stemme» som forklarer stortingssaker for vanlige borgere.

${LANGUAGE_RULES}

${BANNED_GENERIC_TITLES}

${CITIZEN_AND_DEPTH}

${sakType}

KILDE:
---
${sakContextText}
---

Lag ${compact ? 'nøyaktig 3' : '3'} kort med disse id-ene:
${rolesList}

Regler:
- Hvert kort må ha unik body – ikke gjenta samme setninger eller bare sakstittelen.
- Kort "for-vanlige-folk" skal ALLTID forklare betydning for vanlige nordmenn.
- Bruk konkrete ord fra kilden i hvert kort.

Svar med gyldig JSON som matcher skjemaet.`;
}

export function buildSingleCardRegenerationPrompt(
  sakContextText: string,
  ctx: SakContext,
  card: SummaryCard,
  feedback: string,
  missingAspects: string[],
  suggestedRevision?: string,
  otherCards: SummaryCard[] = []
): string {
  const missing =
    missingAspects.length > 0
      ? `\nMangler fra validering: ${missingAspects.join('; ')}`
      : '';
  const revision = suggestedRevision?.trim()
    ? `\nForslag til forbedring: ${suggestedRevision}`
    : '';
  const role = SUMMARY_CARD_ROLES.find((r) => r.id === card.id);
  const roleHint = role
    ? `\nKortets rolle: ${role.instruction}`
    : card.id === 'for-vanlige-folk'
      ? '\nForklar betydning for vanlige nordmenn.'
      : '';

  return `Du skriver på nytt ETT oppsummeringskort for en stortingssak.

${LANGUAGE_RULES}

${BANNED_GENERIC_TITLES}

${ctx.sakTypeLabel ? `Sakstype: ${ctx.sakTypeLabel}` : ''}

KILDE:
---
${sakContextText}
---
${otherCardsBlock(otherCards)}

Kort som feilet (id beholdes: "${card.id}"):
Tittel: ${card.title}
Tekst: ${card.body}

Tilbakemelding: ${feedback}${missing}${revision}${roleHint}

Skriv kun dette kortet på nytt. Ikke gjenta andre kort. body skal være utdypende og faktabasert.`;
}

export function buildCardValidationPrompt(
  sakContextText: string,
  _ctx: SakContext,
  card: SummaryCard,
  otherCards: SummaryCard[] = []
): string {
  return `Du er kvalitetskontrollør for AI-oppsummering av stortingssaker.

${LANGUAGE_RULES}

KILDE:
---
${sakContextText}
---
${otherCardsBlock(otherCards)}

Kort:
- id: ${card.id}
- title: ${card.title}
- body: ${card.body}

Sjekkliste – godkjenn KUN hvis alt er oppfylt:
- body er utdypende og ikke bare en gjentakelse av sakstittelen
- id "for-vanlige-folk" må forklare betydning for vanlige nordmenn (direkte eller ærlig indirekte)
- body overlapper ikke vesentlig med andre kort (ulike aspekter)
- Konkrete fakta fra kilden der det er mulig
- score under 70 hvis generisk, repetitiv eller for tynn

Svar med JSON.`;
}

/** Tre obligatoriske vinkler – hvert kort skal dekke sitt eget aspekt. */
export const SUMMARY_CARD_ROLES = [
  {
    id: 'sakens-kjerne',
    defaultTitle: 'Hva saken handler om',
    hint: 'Innhold og vedtak',
    instruction: `Kort 1 – SAKENS INNHOLD:
Forklar på 2–3 setninger hva saken faktisk gjelder: konkrete endringer, forslag, rapporter eller vedtak.
Ikke kopier bare sakstittelen. Ta med detaljer fra innstilling, vedtak eller dokumentutdrag.`,
  },
  {
    id: 'for-vanlige-folk',
    defaultTitle: 'For deg som borger',
    hint: 'Betydning i hverdagen',
    instruction: `Kort 2 – FOR VANLIGE NORDMENN:
Forklar på 2–3 setninger hvordan dette kan påvirke en vanlig nordmann – direkte eller indirekte.
Bygg på kilden. Ved styrings- eller prosessaker: forklar ærlig hvordan det påvirker demokrati, tjenester eller regler folk møter.
Ikke finn på personlige konsekvenser som ikke følger av teksten.`,
  },
  {
    id: 'konkret-fra-kilden',
    defaultTitle: 'Viktig detalj',
    hint: 'Fra dokumentene',
    instruction: `Kort 3 – ANNET ASPEKT FRA KILDEN:
Gi 2–3 setninger med prosess, hvem som behandler saken, tidsplan, eller et konkret punkt fra dokumentet.
Må være et ANNET aspekt enn kort 1 og 2. Ikke gjenta samme setninger.`,
  },
] as const;

export type SummaryCardRoleId = (typeof SUMMARY_CARD_ROLES)[number]['id'];

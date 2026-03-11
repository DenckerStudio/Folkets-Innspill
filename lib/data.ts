export interface Issue {
  id: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  votes: {
    for: number;
    against: number;
    abstain: number;
    total: number;
  };
  status: 'pending' | 'voted' | 'closed';
}

export const mockIssues: Issue[] = [
  {
    id: '1',
    title: 'Representantforslag om å styrke fastlegeordningen',
    summary: 'Forslag fra flere representanter om strakstiltak for å redde fastlegeordningen, inkludert økt basistilskudd og redusert listelengde. Målet er å sikre at alle innbyggere har tilgang til en fastlege, og at arbeidsbelastningen for legene blir forsvarlig.',
    category: 'Helse og omsorg',
    date: '2026-10-15',
    votes: { for: 8092, against: 4358, abstain: 0, total: 12450 },
    status: 'pending'
  },
  {
    id: '2',
    title: 'Utbygging av havvind i Sørlige Nordsjø II',
    summary: 'Regjeringens forslag til rammeverk for tildeling av areal og støtteordninger for utbygging av bunnfast havvind. Saken omhandler også hvordan kraften skal ilandføres og hvilke miljøkrav som skal stilles til utbyggerne.',
    category: 'Energi og miljø',
    date: '2026-10-22',
    votes: { for: 4014, against: 4906, abstain: 0, total: 8920 },
    status: 'pending'
  },
  {
    id: '3',
    title: 'Endringer i opplæringslova (fraværsgrensen)',
    summary: 'Forslag om å justere dagens fraværsgrense i videregående skole. Forslaget innebærer at rektor får utvidet myndighet til å utøve skjønn i spesielle tilfeller, samtidig som hovedregelen om 10 % grense opprettholdes.',
    category: 'Utdanning og forskning',
    date: '2026-11-05',
    votes: { for: 15200, against: 12100, abstain: 500, total: 27800 },
    status: 'pending'
  },
  {
    id: '4',
    title: 'Ny nasjonal transportplan (NTP) 2026-2037',
    summary: 'Behandling av regjeringens forslag til ny NTP. Planen staker ut kursen for samferdselspolitikken de neste 12 årene, med prioritering av vedlikehold fremfor nye store motorveiprosjekter, samt økt satsing på jernbane i byområdene.',
    category: 'Transport og kommunikasjon',
    date: '2026-09-10',
    votes: { for: 5600, against: 6200, abstain: 1200, total: 13000 },
    status: 'closed'
  },
  {
    id: '5',
    title: 'Forslag om innføring av grunnrenteskatt på havbruk',
    summary: 'Behandling av revidert modell for grunnrenteskatt på havbruk. Forslaget setter skattesatsen til 25 %, med et bunnfradrag på 70 millioner kroner for å skjerme de minste oppdretterne.',
    category: 'Næring og finans',
    date: '2026-11-20',
    votes: { for: 9500, against: 11200, abstain: 300, total: 21000 },
    status: 'pending'
  }
];

export const categories = [
  'Alle',
  'Helse og omsorg',
  'Energi og miljø',
  'Utdanning og forskning',
  'Transport og kommunikasjon',
  'Næring og finans',
  'Justis',
  'Familie og kultur',
  'Arbeid og sosial',
  'Utenriks og forsvar'
];

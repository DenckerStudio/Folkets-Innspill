import { mapStortingetVoteCode } from './stortinget-mappings';
import { getVoteringer, getVoteringsresultat, type StortingetSakVotering } from './stortinget';

export type PartyVoteSummary = {
  partiId: string;
  partiNavn: string;
  for: number;
  mot: number;
  ikkeTilstede: number;
  total: number;
  majority: 'for' | 'mot' | 'abstain' | 'mixed';
};

export type VoteringSummary = {
  voteringId: number;
  tema: string;
  vedtatt: boolean;
  personligVotering: boolean;
  antallFor: number;
  antallMot: number;
  antallIkkeTilstede: number;
  resultatTekst: string | null;
  voteringTid: string | null;
  partyBreakdown: PartyVoteSummary[];
};

const SKIP_TEMA_PATTERNS = [
  /vedlegges protokollen/i,
  /lovens overskrift og loven i sin helhet/i,
  /romertallene/i,
];

export function shouldSkipVoteringForStats(v: StortingetSakVotering): boolean {
  if (!v.personlig_votering) return true;
  if (v.votering_resultat_type === 'enstemmig_vedtatt' && (v.antall_for ?? -1) < 0) return true;
  const tema = v.votering_tema ?? '';
  return SKIP_TEMA_PATTERNS.some((re) => re.test(tema));
}

export function pickMainVotering(voteringer: StortingetSakVotering[]): StortingetSakVotering | null {
  const candidates = voteringer.filter((v) => !shouldSkipVoteringForStats(v));
  if (candidates.length === 0) {
    return voteringer.find((v) => v.fri_votering) ?? voteringer.at(-1) ?? null;
  }
  const finalPass = candidates.filter((v) => v.fri_votering || /innstilling|vedtak|helhet/i.test(v.votering_tema ?? ''));
  const pool = finalPass.length > 0 ? finalPass : candidates;
  return pool.at(-1) ?? null;
}

export async function buildPartyBreakdown(voteringId: number): Promise<PartyVoteSummary[]> {
  const resultater = await getVoteringsresultat(voteringId);
  const byParty = new Map<string, PartyVoteSummary>();

  for (const row of resultater) {
    const parti = row.representant?.parti;
    if (!parti?.id) continue;
    const vote = mapStortingetVoteCode(row.votering);
    if (vote === 'ukjent') continue;

    let entry = byParty.get(parti.id);
    if (!entry) {
      entry = {
        partiId: parti.id,
        partiNavn: parti.navn,
        for: 0,
        mot: 0,
        ikkeTilstede: 0,
        total: 0,
        majority: 'mixed',
      };
      byParty.set(parti.id, entry);
    }

    entry.total += 1;
    if (vote === 'for') entry.for += 1;
    else if (vote === 'mot') entry.mot += 1;
    else entry.ikkeTilstede += 1;
  }

  for (const entry of byParty.values()) {
    const voting = entry.for + entry.mot;
    if (voting === 0) {
      entry.majority = 'abstain';
    } else if (entry.for > entry.mot) {
      entry.majority = 'for';
    } else if (entry.mot > entry.for) {
      entry.majority = 'mot';
    } else {
      entry.majority = 'mixed';
    }
  }

  return Array.from(byParty.values()).sort((a, b) => a.partiNavn.localeCompare(b.partiNavn, 'no'));
}

export async function getVoteringSummaryForSak(sakId: string): Promise<{
  voteringer: StortingetSakVotering[];
  main: VoteringSummary | null;
}> {
  const voteringer = await getVoteringer(sakId);
  const mainRaw = pickMainVotering(voteringer);
  if (!mainRaw?.votering_id) {
    return { voteringer, main: null };
  }

  const partyBreakdown = mainRaw.personlig_votering
    ? await buildPartyBreakdown(mainRaw.votering_id)
    : [];

  return {
    voteringer,
    main: {
      voteringId: mainRaw.votering_id,
      tema: mainRaw.votering_tema ?? '',
      vedtatt: Boolean(mainRaw.vedtatt),
      personligVotering: Boolean(mainRaw.personlig_votering),
      antallFor: mainRaw.antall_for ?? 0,
      antallMot: mainRaw.antall_mot ?? 0,
      antallIkkeTilstede: mainRaw.antall_ikke_tilstede ?? 0,
      resultatTekst: mainRaw.votering_resultat_type_tekst ?? null,
      voteringTid: mainRaw.votering_tid ?? null,
      partyBreakdown,
    },
  };
}

export type ValgomatPartyScore = {
  partiId: string;
  partiNavn: string;
  agree: number;
  disagree: number;
  skipped: number;
  score: number;
};

export function compareUserVoteToParty(
  userChoice: 'for' | 'against' | 'abstain',
  partyMajority: PartyVoteSummary['majority']
): 'agree' | 'disagree' | 'skipped' {
  if (userChoice === 'abstain' || partyMajority === 'abstain' || partyMajority === 'mixed') {
    return 'skipped';
  }
  const userFor = userChoice === 'for';
  const partyFor = partyMajority === 'for';
  return userFor === partyFor ? 'agree' : 'disagree';
}

export function computeValgomatScores(
  comparisons: Array<{ party: PartyVoteSummary; result: 'agree' | 'disagree' | 'skipped' }>
): ValgomatPartyScore[] {
  const scores = new Map<string, ValgomatPartyScore>();

  for (const { party, result } of comparisons) {
    let entry = scores.get(party.partiId);
    if (!entry) {
      entry = {
        partiId: party.partiId,
        partiNavn: party.partiNavn,
        agree: 0,
        disagree: 0,
        skipped: 0,
        score: 0,
      };
      scores.set(party.partiId, entry);
    }
    if (result === 'agree') entry.agree += 1;
    else if (result === 'disagree') entry.disagree += 1;
    else entry.skipped += 1;
  }

  return Array.from(scores.values())
    .map((s) => {
      const total = s.agree + s.disagree;
      return { ...s, score: total > 0 ? Math.round((s.agree / total) * 100) : 0 };
    })
    .sort((a, b) => b.score - a.score || b.agree - a.agree);
}

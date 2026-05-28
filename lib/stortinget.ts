'use server';

import { STORTINGET_ACTIVE_PERIODE_ID, STORTINGET_ACTIVE_SESSION_ID } from './stortinget-config';
import { parseStortingetDotNetDateToISO, stortingetUrl, type StortingetFormat } from './stortinget-utils';

function getActiveSesjonId(): string {
  return STORTINGET_ACTIVE_SESSION_ID;
}

function getActiveStortingsperiodeId(): string {
  return STORTINGET_ACTIVE_PERIODE_ID;
}

export interface StortingetSak {
  id: number;
  tittel: string;
  korttittel: string;
  status: number;
  emne_liste?: { navn: string }[];
  sist_oppdatert_dato: string;
  henvisning: string;
}

export interface StortingetParti {
  id: string;
  navn: string;
  representert_parti: boolean;
}

async function getVoteTotals(issueIds: string[]): Promise<Record<string, { for: number; against: number; abstain: number; total: number }>> {
  const result: Record<string, { for: number; against: number; abstain: number; total: number }> = {};

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return result;
  }

  try {
    const { getServiceSupabase } = await import('./supabase');
    const service = getServiceSupabase();
    const { data, error } = await service.rpc('get_vote_totals_batch', {
      p_issue_ids: issueIds,
    });

    if (error || !data || typeof data !== 'object') {
      return result;
    }

    const batch = data as Record<string, { for?: number; against?: number; abstain?: number; total?: number }>;
    for (const [issueId, counts] of Object.entries(batch)) {
      const forCount = counts.for ?? 0;
      const againstCount = counts.against ?? 0;
      const abstainCount = counts.abstain ?? 0;
      result[issueId] = {
        for: forCount,
        against: againstCount,
        abstain: abstainCount,
        total: counts.total ?? forCount + againstCount + abstainCount,
      };
    }
  } catch (e) {
    console.error('Failed to fetch vote totals from Supabase:', e);
  }

  return result;
}

export async function getSaker(): Promise<any[]> {
  try {
    const res = await fetch(
      stortingetUrl('/eksport/saker', { stortingssesjonid: getActiveSesjonId(), format: 'json' satisfies StortingetFormat }),
      {
      cache: 'no-store'
      }
    );
    if (!res.ok) throw new Error('Failed to fetch saker');
    const data = await res.json();
    
    const saker = data.saker_liste.map((sak: StortingetSak) => ({
      id: sak.id.toString(),
      title: sak.korttittel || sak.tittel,
      summary: sak.tittel,
      category: sak.emne_liste && sak.emne_liste.length > 0 ? sak.emne_liste[0].navn : 'Generelt',
      date: parseStortingetDotNetDateToISO(sak.sist_oppdatert_dato),
      votes: { for: 0, against: 0, abstain: 0, total: 0 },
      status: sak.status === 1 ? 'pending' : 'closed',
    }));

    const issueIds = saker.map((s: any) => s.id);
    const voteTotals = await getVoteTotals(issueIds);

    for (const sak of saker) {
      if (voteTotals[sak.id]) {
        sak.votes = voteTotals[sak.id];
      }
    }

    return saker;
  } catch (error) {
    console.error("Error fetching saker:", error);
    return [];
  }
}

export async function getSak(id: string): Promise<any | null> {
  const saker = await getSaker();
  return saker.find((s: any) => s.id === id) || null;
}

export async function getSakDetail(sakId: string, opts?: { nextRevalidateSeconds?: number }): Promise<any | null> {
  try {
    const res = await fetch(stortingetUrl('/eksport/sak', { sakid: sakId, format: 'json' satisfies StortingetFormat }), {
      next: opts?.nextRevalidateSeconds ? { revalidate: opts.nextRevalidateSeconds } : undefined,
      cache: opts?.nextRevalidateSeconds ? undefined : 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('Error fetching sak detail:', e);
    return null;
  }
}

export interface StortingetRepresentant {
  id: string;
  fornavn: string;
  etternavn: string;
  fylke: {
    navn: string;
  };
  parti: {
    id: string;
    navn: string;
  };
}

export async function getRepresentanter(): Promise<StortingetRepresentant[]> {
  try {
    const res = await fetch(stortingetUrl('/eksport/dagensrepresentanter', { format: 'json' satisfies StortingetFormat }), {
      next: { revalidate: 86400 }
    });
    if (!res.ok) throw new Error('Failed to fetch representanter');
    const data = await res.json();
    return data.dagensrepresentanter_liste || [];
  } catch (error) {
    console.error("Error fetching representanter:", error);
    return [];
  }
}

export async function getRepresentanterForPeriode(periodeId?: string): Promise<StortingetRepresentant[]> {
  try {
    const res = await fetch(
      stortingetUrl('/eksport/representanter', {
        stortingsperiodeid: periodeId || getActiveStortingsperiodeId(),
        format: 'json' satisfies StortingetFormat,
      }),
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) throw new Error('Failed to fetch representanter (periode)');
    const data = await res.json();
    return data.representanter_liste || [];
  } catch (error) {
    console.error('Error fetching representanter (periode):', error);
    return [];
  }
}

export interface StortingetPerson {
  id: string;
  fornavn: string;
  etternavn: string;
  kjoenn?: 'mann' | 'kvinne' | string;
  foedselsdato?: string;
  doedsdato?: string;
}

export async function getPerson(personId: string): Promise<StortingetPerson | null> {
  try {
    const res = await fetch(stortingetUrl('/eksport/person', { personid: personId, format: 'json' satisfies StortingetFormat }), {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('Error fetching person:', e);
    return null;
  }
}

export interface StortingetSaksgang {
  id: string;
  navn: string;
  saksgang_steg_liste?: Array<{
    id: string;
    navn: string;
    steg_nummer?: number;
  }>;
}

export async function getSaksganger(): Promise<StortingetSaksgang[]> {
  try {
    const res = await fetch(stortingetUrl('/eksport/saksganger', { format: 'json' satisfies StortingetFormat }), {
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error('Failed to fetch saksganger');
    const data = await res.json();
    return data.saksgang_liste || [];
  } catch (e) {
    console.error('Error fetching saksganger:', e);
    return [];
  }
}

export type SporsmalType = 'sporretimesporsmal' | 'interpellasjoner' | 'skriftligesporsmal';

export interface StortingetSporsmalOversiktResponse {
  sporsmal_liste?: any[];
}

export async function getSporsmalListe(args: {
  type: SporsmalType;
  sesjonId?: string;
  status?: string;
  nextRevalidateSeconds?: number;
}): Promise<any[]> {
  const sesjonId = args.sesjonId || getActiveSesjonId();
  try {
    const res = await fetch(
      stortingetUrl(`/eksport/${args.type}`, {
        sesjonid: sesjonId,
        status: args.status,
        format: 'json' satisfies StortingetFormat,
      }),
      {
        next: args.nextRevalidateSeconds ? { revalidate: args.nextRevalidateSeconds } : { revalidate: 3600 },
      }
    );
    if (!res.ok) throw new Error(`Failed to fetch spørsmål (${args.type})`);
    const data = (await res.json()) as StortingetSporsmalOversiktResponse;
    return data.sporsmal_liste || [];
  } catch (e) {
    console.error(`Error fetching spørsmål (${args.type}):`, e);
    return [];
  }
}

export async function getPartier(): Promise<StortingetParti[]> {
  try {
    const res = await fetch(stortingetUrl('/eksport/partier', { format: 'json' satisfies StortingetFormat }), {
      next: { revalidate: 86400 }
    });
    if (!res.ok) throw new Error('Failed to fetch partier');
    const data = await res.json();
    return data.partier_liste || [];
  } catch (error) {
    console.error("Error fetching partier:", error);
    return [];
  }
}

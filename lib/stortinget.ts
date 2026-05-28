'use server';

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

function parseStortingetDate(dateStr: string): string {
  if (!dateStr) return '';
  const match = dateStr.match(/\/Date\((\d+)[+-]\d+\)\//);
  if (match && match[1]) {
    const date = new Date(parseInt(match[1], 10));
    return date.toISOString().split('T')[0];
  }
  return dateStr;
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
    const res = await fetch('https://data.stortinget.no/eksport/saker?stortingssesjonid=2025-2026&format=json', {
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch saker');
    const data = await res.json();
    
    const saker = data.saker_liste.map((sak: StortingetSak) => ({
      id: sak.id.toString(),
      title: sak.korttittel || sak.tittel,
      summary: sak.tittel,
      category: sak.emne_liste && sak.emne_liste.length > 0 ? sak.emne_liste[0].navn : 'Generelt',
      date: parseStortingetDate(sak.sist_oppdatert_dato),
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
    const res = await fetch('https://data.stortinget.no/eksport/dagensrepresentanter?format=json', {
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

export async function getPartier(): Promise<StortingetParti[]> {
  try {
    const res = await fetch('https://data.stortinget.no/eksport/partier?format=json', {
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

'use server';

import { STORTINGET_ACTIVE_PERIODE_ID, STORTINGET_ACTIVE_SESSION_ID } from './stortinget-config';
import {
  formatEmneNavn,
  isSakOpenForVoting,
  sakDokumentgruppeLabel,
  sakStatusLabel,
  sakTypeLabel,
} from './stortinget-mappings';
import { parseStortingetDotNetDateToISO, stortingetUrl, type StortingetFormat } from './stortinget-utils';

function getActiveSesjonId(): string {
  return STORTINGET_ACTIVE_SESSION_ID;
}

function getActiveStortingsperiodeId(): string {
  return STORTINGET_ACTIVE_PERIODE_ID;
}

export interface StortingetEmne {
  id?: number;
  navn: string;
  er_hovedemne?: boolean;
  underemne_liste?: StortingetEmne[];
}

export interface StortingetSak {
  id: number;
  tittel: string;
  korttittel: string;
  status: number;
  type?: number;
  dokumentgruppe?: number;
  emne_liste?: StortingetEmne[];
  komite?: { id?: string; navn: string };
  sist_oppdatert_dato: string;
  henvisning: string;
  forslagstiller_liste?: unknown[];
  saksordfoerer_liste?: unknown[];
}

export interface StortingetSakVotering {
  votering_id: number;
  sak_id?: number;
  votering_tema?: string;
  vedtatt?: boolean;
  personlig_votering?: boolean;
  fri_votering?: boolean;
  antall_for?: number;
  antall_mot?: number;
  antall_ikke_tilstede?: number;
  votering_resultat_type?: string;
  votering_resultat_type_tekst?: string | null;
  votering_tid?: string;
}

export interface StortingetVoteringsresultatRad {
  votering: number | string;
  representant?: {
    id: string;
    fornavn: string;
    etternavn: string;
    parti?: { id: string; navn: string };
    fylke?: { navn: string };
  };
}

async function fetchStortingetJson<T>(
  pathname: string,
  query: Record<string, string | number | boolean | undefined>,
  revalidateSeconds?: number
): Promise<T | null> {
  try {
    const res = await fetch(stortingetUrl(pathname, { ...query, format: 'json' satisfies StortingetFormat }), {
      next: revalidateSeconds != null ? { revalidate: revalidateSeconds } : undefined,
      cache: revalidateSeconds != null ? undefined : 'no-store',
      redirect: 'follow',
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (e) {
    console.error(`[stortinget] ${pathname} failed:`, e);
    return null;
  }
}

function mapSakListItem(sak: StortingetSak) {
  const emner = (sak.emne_liste ?? []).map((e) => ({
    id: e.id,
    navn: formatEmneNavn(e.navn),
    erHovedemne: e.er_hovedemne,
  }));
  const statusLabel = sakStatusLabel(sak.status);

  return {
    id: sak.id.toString(),
    title: sak.korttittel || sak.tittel,
    summary: sak.tittel,
    category: emner[0]?.navn ?? 'Generelt',
    categories: emner.map((e) => e.navn),
    emner,
    date: parseStortingetDotNetDateToISO(sak.sist_oppdatert_dato),
    votes: { for: 0, against: 0, abstain: 0, total: 0 },
    status: isSakOpenForVoting(sak.status) ? 'pending' : 'closed',
    statusLabel,
    sakType: sakTypeLabel(sak.type),
    dokumentgruppe: sakDokumentgruppeLabel(sak.dokumentgruppe),
    komite: sak.komite?.navn ?? null,
    henvisning: sak.henvisning ?? null,
  };
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
    
    const saker = data.saker_liste.map((sak: StortingetSak) => mapSakListItem(sak));

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

const PUBLIKASJON_FETCH_TIMEOUT_MS = 8_000;

function stripHtmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, ' ')
    .trim();
}

/** Henter publikasjon som HTML og returnerer ren tekst (for AI-kontekst). */
export async function getPublikasjonText(
  publikasjonId: string,
  maxChars = 3000
): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PUBLIKASJON_FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(
      stortingetUrl('/eksport/publikasjon', {
        publikasjonid: publikasjonId,
        format: 'html',
      }),
      { signal: controller.signal, cache: 'no-store' }
    );
    if (!res.ok) return null;

    const html = await res.text();
    const text = stripHtmlToText(html);
    if (!text) return null;
    return text.length > maxChars ? `${text.slice(0, maxChars)}…` : text;
  } catch (e) {
    console.warn(`[stortinget] Kunne ikke hente publikasjon ${publikasjonId}:`, e);
    return null;
  } finally {
    clearTimeout(timeout);
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

export async function getPartier(sesjonId?: string): Promise<StortingetParti[]> {
  const data = await fetchStortingetJson<{ partier_liste?: StortingetParti[] }>(
    '/eksport/partier',
    { sesjonid: sesjonId || getActiveSesjonId() },
    86400
  );
  return data?.partier_liste ?? [];
}

export async function getEmner(): Promise<StortingetEmne[]> {
  const data = await fetchStortingetJson<{ emne_liste?: StortingetEmne[] }>('/eksport/emner', {}, 86400);
  return data?.emne_liste ?? [];
}

export async function getKomiteer(sesjonId?: string): Promise<Array<{ id: string; navn: string }>> {
  const data = await fetchStortingetJson<{ komiteer_liste?: Array<{ id: string; navn: string }> }>(
    '/eksport/komiteer',
    { sesjonid: sesjonId || getActiveSesjonId() },
    86400
  );
  return data?.komiteer_liste ?? [];
}

export async function getVoteringer(sakId: string): Promise<StortingetSakVotering[]> {
  const data = await fetchStortingetJson<{ sak_votering_liste?: StortingetSakVotering[] }>(
    '/eksport/voteringer',
    { sakid: sakId },
    86400
  );
  return data?.sak_votering_liste ?? [];
}

export async function getVoteringsresultat(voteringId: number | string): Promise<StortingetVoteringsresultatRad[]> {
  const data = await fetchStortingetJson<{ voteringsresultat_liste?: StortingetVoteringsresultatRad[] }>(
    '/eksport/voteringsresultat',
    { voteringid: voteringId },
    86400
  );
  return data?.voteringsresultat_liste ?? [];
}

export async function getVoteringsforslag(voteringId: number | string): Promise<any[]> {
  const data = await fetchStortingetJson<{ voteringsforslag_liste?: any[] }>(
    '/eksport/voteringsforslag',
    { voteringid: voteringId },
    86400
  );
  return data?.voteringsforslag_liste ?? [];
}

export async function getHoringer(sesjonId?: string): Promise<any[]> {
  const data = await fetchStortingetJson<{ horinger_liste?: any[] }>(
    '/eksport/horinger',
    { sesjonid: sesjonId || getActiveSesjonId() },
    3600
  );
  return data?.horinger_liste ?? [];
}

export async function getHoringDetail(horingId: string): Promise<any | null> {
  const liste = await getHoringer();
  return liste.find((h) => String(h.id) === String(horingId)) ?? null;
}

export async function getHoringsprogram(horingId: string): Promise<any | null> {
  return fetchStortingetJson('/eksport/horingsprogram', { horingid: horingId }, 3600);
}

export async function getHoringsinnspill(horingId: string): Promise<any[]> {
  const data = await fetchStortingetJson<{ horingsinnspill_liste?: any[] }>(
    '/eksport/horingsinnspill',
    { horingid: horingId },
    3600
  );
  return data?.horingsinnspill_liste ?? [];
}

export async function getMoter(sesjonId?: string): Promise<any[]> {
  const data = await fetchStortingetJson<{ moter_liste?: any[] }>(
    '/eksport/moter',
    { sesjonid: sesjonId || getActiveSesjonId() },
    3600
  );
  return data?.moter_liste ?? [];
}

export async function getDagsorden(moteId: string): Promise<any | null> {
  return fetchStortingetJson('/eksport/dagsorden', { moteid: moteId }, 3600);
}

export async function getEnkeltsporsmal(nSporsmalId: string): Promise<any | null> {
  return fetchStortingetJson('/eksport/enkeltsporsmal', { NSporsmalId: nSporsmalId }, 3600);
}

export async function getVedtak(sesjonId?: string): Promise<any[]> {
  const data = await fetchStortingetJson<{ stortingsvedtak_liste?: any[] }>(
    '/eksport/vedtak',
    { sesjonid: sesjonId || getActiveSesjonId() },
    3600
  );
  return data?.stortingsvedtak_liste ?? [];
}

export async function getPublikasjoner(args: {
  sesjonId?: string;
  publikasjonstype: string;
}): Promise<any[]> {
  const data = await fetchStortingetJson<{ publikasjoner_liste?: any[] }>(
    '/eksport/publikasjoner',
    {
      sesjonid: args.sesjonId || getActiveSesjonId(),
      publikasjonstype: args.publikasjonstype,
    },
    86400
  );
  return data?.publikasjoner_liste ?? [];
}

export async function getRegjering(): Promise<any[]> {
  const data = await fetchStortingetJson<{ regjeringsmedlemmer_liste?: any[] }>('/eksport/regjering', {}, 86400);
  return data?.regjeringsmedlemmer_liste ?? [];
}

export async function getKodetBiografi(personId: string): Promise<any | null> {
  return fetchStortingetJson('/eksport/kodetbiografi', { personid: personId }, 86400);
}

/** Map sakId -> earliest planned møte date from dagsorden (best effort). */
export async function getSakPlannedDates(sesjonId?: string): Promise<Record<string, string>> {
  const moter = await getMoter(sesjonId);
  const result: Record<string, string> = {};

  const moterMedId = moter.filter((m) => m.id && m.id !== -1);
  for (const mote of moterMedId.slice(0, 40)) {
    const dagsorden = await getDagsorden(String(mote.id));
    const dato = parseStortingetDotNetDateToISO(mote.mote_dato_tid ?? '');
    const saker = dagsorden?.dagsordensak_liste ?? dagsorden?.dagsorden_sak_liste ?? dagsorden?.sak_liste ?? [];
    for (const sak of saker) {
      const sakId = String(sak.sak_id ?? sak.id ?? '');
      if (sakId && dato && !result[sakId]) {
        result[sakId] = dato;
      }
    }
  }

  return result;
}

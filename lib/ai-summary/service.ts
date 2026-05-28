import { getServiceSupabase } from '@/lib/supabase';
import { getSak } from '@/lib/stortinget';
import { buildSakContextText, fetchDetailedSak, hashSakContext } from './context';
import {
  allFieldsApproved,
  generateInitialSummaries,
  iterateAndApproveSummaries,
} from './validator';
import type { ApprovedSummaryRecord, SakContext, SummaryCards } from './types';

function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function buildSakContext(issueId: string): Promise<SakContext | null> {
  const sak = await getSak(issueId);
  if (!sak) return null;

  const detail = await fetchDetailedSak(issueId);

  return {
    issueId,
    title: sak.title,
    summary: sak.summary,
    category: sak.category,
    ...detail,
  };
}

export async function getCachedSummary(
  issueId: string,
  contextHash: string
): Promise<SummaryCards | null> {
  if (!supabaseConfigured()) return null;

  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('issue_ai_summaries')
      .select('hva, hvem, kostnad, context_hash')
      .eq('stortinget_issue_id', issueId)
      .maybeSingle();

    if (error || !data) return null;
    if (data.context_hash !== contextHash) return null;

    return {
      hva: data.hva,
      hvem: data.hvem,
      kostnad: data.kostnad,
    };
  } catch (e) {
    console.error('[ai-summary] Kunne ikke hente cache:', e);
    return null;
  }
}

export async function saveApprovedSummary(
  issueId: string,
  summaries: SummaryCards,
  contextHash: string
): Promise<void> {
  if (!supabaseConfigured()) return;

  const supabase = getServiceSupabase();
  const row: Omit<ApprovedSummaryRecord, 'approved_at'> = {
    stortinget_issue_id: issueId,
    hva: summaries.hva,
    hvem: summaries.hvem,
    kostnad: summaries.kostnad,
    context_hash: contextHash,
  };

  const { error } = await supabase.from('issue_ai_summaries').upsert(
    {
      ...row,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'stortinget_issue_id' }
  );

  if (error) {
    console.error('[ai-summary] Kunne ikke lagre godkjent sammendrag:', error);
  }
}

export interface AiSummaryResponse {
  hva: string;
  hvem: string;
  kostnad: string;
  cached: boolean;
  allApproved: boolean;
}

export async function getOrCreateApprovedAiSummary(
  issueId: string
): Promise<AiSummaryResponse | null> {
  const ctx = await buildSakContext(issueId);
  if (!ctx) return null;

  const contextHash = hashSakContext(ctx);
  const cached = await getCachedSummary(issueId, contextHash);
  if (cached) {
    return { ...cached, cached: true, allApproved: true };
  }

  const { summaries, validations } = await iterateAndApproveSummaries(ctx);
  const allApproved = allFieldsApproved(validations);

  if (allApproved) {
    await saveApprovedSummary(issueId, summaries, contextHash);
  }

  return {
    ...summaries,
    cached: false,
    allApproved,
  };
}

/** For testing / tvungen regenerering */
export async function regenerateAiSummary(issueId: string): Promise<AiSummaryResponse | null> {
  const ctx = await buildSakContext(issueId);
  if (!ctx) return null;

  const initial = await generateInitialSummaries(ctx);
  const { summaries, validations } = await iterateAndApproveSummaries(ctx, initial);
  const contextHash = hashSakContext(ctx);
  const allApproved = allFieldsApproved(validations);

  if (allApproved) {
    await saveApprovedSummary(issueId, summaries, contextHash);
  }

  return {
    ...summaries,
    cached: false,
    allApproved,
  };
}

export { buildSakContextText };

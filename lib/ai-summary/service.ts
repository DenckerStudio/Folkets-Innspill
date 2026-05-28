import { getServiceSupabase } from '@/lib/supabase';
import { getSak } from '@/lib/stortinget';
import { buildSakContextText, fetchDetailedSak, hashSakContext } from './context';
import {
  buildFieldStatusMap,
  iterateAndApproveSummaries,
} from './validator';
import type {
  CachedFieldsResult,
  FieldStatus,
  FieldValidationResult,
  SakContext,
  SummaryCards,
  SummaryField,
} from './types';
import {
  allSummaryFieldsApproved,
  FIELD_APPROVED_AT_COLUMN,
  missingSummaryFields,
  SUMMARY_FIELDS,
} from './types';

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

type DbSummaryRow = {
  hva: string | null;
  hvem: string | null;
  kostnad: string | null;
  context_hash: string;
  hva_approved_at: string | null;
  hvem_approved_at: string | null;
  kostnad_approved_at: string | null;
};

function parseApprovedFields(row: DbSummaryRow, contextHash: string): CachedFieldsResult {
  if (row.context_hash !== contextHash) {
    return { summaries: {}, approvedFields: [], contextHash: null };
  }

  const summaries: Partial<SummaryCards> = {};
  const approvedFields: SummaryField[] = [];

  for (const field of SUMMARY_FIELDS) {
    const approvedAt = row[FIELD_APPROVED_AT_COLUMN[field]];
    const text = row[field]?.trim();
    if (approvedAt && text) {
      summaries[field] = text;
      approvedFields.push(field);
    }
  }

  return { summaries, approvedFields, contextHash: row.context_hash };
}

export async function getCachedFields(
  issueId: string,
  contextHash: string
): Promise<CachedFieldsResult> {
  if (!supabaseConfigured()) {
    return { summaries: {}, approvedFields: [], contextHash: null };
  }

  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('issue_ai_summaries')
      .select(
        'hva, hvem, kostnad, context_hash, hva_approved_at, hvem_approved_at, kostnad_approved_at'
      )
      .eq('stortinget_issue_id', issueId)
      .maybeSingle();

    if (error || !data) {
      return { summaries: {}, approvedFields: [], contextHash: null };
    }

    return parseApprovedFields(data as DbSummaryRow, contextHash);
  } catch (e) {
    console.error('[ai-summary] Kunne ikke hente cache:', e);
    return { summaries: {}, approvedFields: [], contextHash: null };
  }
}

export async function saveApprovedField(
  issueId: string,
  field: SummaryField,
  text: string,
  contextHash: string,
  allFieldsNowApproved: boolean
): Promise<void> {
  if (!supabaseConfigured()) return;

  const supabase = getServiceSupabase();
  const now = new Date().toISOString();
  const approvedCol = FIELD_APPROVED_AT_COLUMN[field];

  const { data: existing } = await supabase
    .from('issue_ai_summaries')
    .select('hva, hvem, kostnad, hva_approved_at, hvem_approved_at, kostnad_approved_at, context_hash')
    .eq('stortinget_issue_id', issueId)
    .maybeSingle();

  const row: Record<string, string | null> = {
    stortinget_issue_id: issueId,
    context_hash: contextHash,
    hva: existing?.hva ?? null,
    hvem: existing?.hvem ?? null,
    kostnad: existing?.kostnad ?? null,
    hva_approved_at: existing?.hva_approved_at ?? null,
    hvem_approved_at: existing?.hvem_approved_at ?? null,
    kostnad_approved_at: existing?.kostnad_approved_at ?? null,
    updated_at: now,
    [field]: text,
    [approvedCol]: now,
  };

  if (allFieldsNowApproved) {
    row.approved_at = now;
  }

  const { error } = await supabase.from('issue_ai_summaries').upsert(row, {
    onConflict: 'stortinget_issue_id',
  });

  if (error) {
    console.error(`[ai-summary] Kunne ikke lagre godkjent felt "${field}":`, error);
    return;
  }

  if (allFieldsNowApproved) {
    const summaries: SummaryCards = { hva: '', hvem: '', kostnad: '' };
    const { data } = await supabase
      .from('issue_ai_summaries')
      .select('hva, hvem, kostnad')
      .eq('stortinget_issue_id', issueId)
      .maybeSingle();

    if (data?.hva && data?.hvem && data?.kostnad) {
      summaries.hva = data.hva;
      summaries.hvem = data.hvem;
      summaries.kostnad = data.kostnad;

      await supabase.from('stortinget_issues').upsert(
        {
          id: issueId,
          ai_summary_json: summaries,
          ai_summary_generated_at: now,
          last_synced_at: now,
        },
        { onConflict: 'id' }
      );
    }
  }
}

export async function clearSummaryCache(issueId: string): Promise<void> {
  if (!supabaseConfigured()) return;

  const supabase = getServiceSupabase();
  await supabase.from('issue_ai_summaries').delete().eq('stortinget_issue_id', issueId);
}

export interface AiSummaryResponse {
  hva?: string;
  hvem?: string;
  kostnad?: string;
  cached: boolean;
  allApproved: boolean;
  pendingFields: SummaryField[];
  fields: Record<SummaryField, FieldStatus>;
}

function buildResponse(
  summaries: Partial<SummaryCards>,
  approvedFields: SummaryField[],
  cached: boolean,
  validations: FieldValidationResult[]
): AiSummaryResponse {
  const fields = buildFieldStatusMap(validations, approvedFields);
  const pendingFields = missingSummaryFields(summaries, approvedFields);
  const approvedOnly: Partial<SummaryCards> = {};

  for (const field of approvedFields) {
    const text = summaries[field]?.trim();
    if (text) approvedOnly[field] = text;
  }

  return {
    ...(approvedOnly.hva ? { hva: approvedOnly.hva } : {}),
    ...(approvedOnly.hvem ? { hvem: approvedOnly.hvem } : {}),
    ...(approvedOnly.kostnad ? { kostnad: approvedOnly.kostnad } : {}),
    cached,
    allApproved: allSummaryFieldsApproved(approvedFields),
    pendingFields,
    fields,
  };
}

async function runApprovalPipeline(
  ctx: SakContext,
  cached: CachedFieldsResult
): Promise<AiSummaryResponse> {
  const contextHash = hashSakContext(ctx);
  let approvedFields = [...cached.approvedFields];
  let summaries: Partial<SummaryCards> = { ...cached.summaries };

  const pending = missingSummaryFields(summaries, approvedFields);
  if (pending.length === 0) {
    return buildResponse(summaries, approvedFields, true, []);
  }

  const approvedSet = new Set(approvedFields);

  const { summaries: finalSummaries, validations, newlyApprovedFields } =
    await iterateAndApproveSummaries(ctx, {
      initial: summaries,
      approvedFields,
      fieldsToProcess: pending,
      onFieldApproved: async (field, value) => {
        approvedSet.add(field);
        summaries[field] = value;
        await saveApprovedField(
          ctx.issueId,
          field,
          value,
          contextHash,
          allSummaryFieldsApproved(Array.from(approvedSet))
        );
      },
    });

  summaries = finalSummaries;
  approvedFields = [
    ...new Set([...approvedFields, ...newlyApprovedFields]),
  ];

  for (const v of validations) {
    if (v.approved && !approvedFields.includes(v.field)) {
      approvedFields.push(v.field);
    }
  }

  return buildResponse(summaries, approvedFields, false, validations);
}

export async function getOrCreateApprovedAiSummary(
  issueId: string
): Promise<AiSummaryResponse | null> {
  const ctx = await buildSakContext(issueId);
  if (!ctx) return null;

  const contextHash = hashSakContext(ctx);
  const cached = await getCachedFields(issueId, contextHash);

  if (allSummaryFieldsApproved(cached.approvedFields)) {
    return buildResponse(cached.summaries, cached.approvedFields, true, []);
  }

  return runApprovalPipeline(ctx, cached);
}

/** For testing / tvungen regenerering */
export async function regenerateAiSummary(
  issueId: string
): Promise<AiSummaryResponse | null> {
  const ctx = await buildSakContext(issueId);
  if (!ctx) return null;

  await clearSummaryCache(issueId);

  const contextHash = hashSakContext(ctx);
  const emptyCache: CachedFieldsResult = {
    summaries: {},
    approvedFields: [],
    contextHash: null,
  };

  return runApprovalPipeline(ctx, emptyCache);
}

export { buildSakContextText };

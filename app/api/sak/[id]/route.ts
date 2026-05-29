import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getSakDetail } from '@/lib/stortinget';
import { triggerAiSummaryWebhook } from '@/lib/trigger-ai-summary-webhook';

export const dynamic = 'force-dynamic';

const DETAIL_CACHE_MAX_AGE_MS = 6 * 60 * 60 * 1000;

async function fetchAndCacheDetail(sakId: string) {
  const service = getServiceSupabase();

  const { data: cached } = await service
    .from('stortinget_issues')
    .select('detail_json, last_synced_at')
    .eq('id', sakId)
    .single();

  if (cached?.detail_json) {
    const age = Date.now() - new Date(cached.last_synced_at).getTime();
    if (age < DETAIL_CACHE_MAX_AGE_MS) {
      return cached.detail_json;
    }
  }

  try {
    const detail = await getSakDetail(sakId);
    if (!detail) return cached?.detail_json || null;

    await service.from('stortinget_issues').upsert(
      {
        id: sakId,
        title: detail.korttittel || detail.tittel || `Sak ${sakId}`,
        summary: detail.tittel || null,
        status: detail.ferdigbehandlet ? 'closed' : 'pending',
        detail_json: detail,
        last_synced_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    const { data: existingSummary } = await service
      .from('issue_ai_summaries')
      .select('stortinget_issue_id')
      .eq('stortinget_issue_id', sakId)
      .maybeSingle();

    if (!existingSummary) {
      triggerAiSummaryWebhook(sakId);
    }

    return detail;
  } catch (e) {
    console.error('Failed to fetch/cache sak detail:', e);
    return cached?.detail_json || null;
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const detail = await fetchAndCacheDetail(id);

  if (!detail) {
    return NextResponse.json({ error: 'Sak ikke funnet' }, { status: 404 });
  }

  return NextResponse.json(detail);
}

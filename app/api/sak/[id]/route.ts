import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

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
    const res = await fetch(
      `https://data.stortinget.no/eksport/sak?sakid=${sakId}&format=json`,
      { cache: 'no-store' }
    );
    if (!res.ok) return cached?.detail_json || null;

    const detail = await res.json();

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

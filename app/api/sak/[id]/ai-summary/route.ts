import { NextResponse } from 'next/server';
import {
  deleteAiSummary,
  resolveAiSummaryForApi,
} from '@/lib/ai-summary/service';
import { triggerAiSummaryWebhook } from '@/lib/trigger-ai-summary-webhook';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Mangler saks-ID' }, { status: 400 });
  }

  const result = await resolveAiSummaryForApi(id, { triggerIfMissing: true });

  if (result.status === 'ready') {
    return NextResponse.json({
      hva: result.hva,
      hvem: result.hvem,
      kostnad: result.kostnad,
      cached: result.cached,
    });
  }

  return NextResponse.json(
    {
      status: 'pending',
      retry_after_seconds: result.retry_after_seconds,
    },
    { status: 202 }
  );
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const force = body?.force === true;

  if (!id) {
    return NextResponse.json({ error: 'Mangler saks-ID' }, { status: 400 });
  }

  if (!force) {
    return GET(request, { params });
  }

  await deleteAiSummary(id);
  triggerAiSummaryWebhook(id);

  return NextResponse.json(
    {
      status: 'pending',
      retry_after_seconds: 15,
      regenerated: true,
    },
    { status: 202 }
  );
}

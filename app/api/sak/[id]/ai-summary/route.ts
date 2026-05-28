import { NextResponse } from 'next/server';
import {
  getOrCreateApprovedAiSummary,
  regenerateAiSummary,
} from '@/lib/ai-summary/service';
import { SUMMARY_FIELDS } from '@/lib/ai-summary/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

function emptyFieldStatus() {
  return Object.fromEntries(
    SUMMARY_FIELDS.map((f) => [f, { approved: false }])
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Mangler saks-ID' }, { status: 400 });
  }

  try {
    const result = await getOrCreateApprovedAiSummary(id);
    if (!result) {
      return NextResponse.json({ error: 'Sak ikke funnet' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('[ai-summary] GET error:', error);
    return NextResponse.json(
      {
        error: true,
        cached: false,
        allApproved: false,
        pendingFields: [...SUMMARY_FIELDS],
        fields: emptyFieldStatus(),
        retry_after_seconds: 10,
      },
      { status: 503 }
    );
  }
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

  try {
    const result = await regenerateAiSummary(id);
    if (!result) {
      return NextResponse.json({ error: 'Sak ikke funnet' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('[ai-summary] POST regenerate error:', error);
    return NextResponse.json(
      {
        error: true,
        allApproved: false,
        pendingFields: [...SUMMARY_FIELDS],
        fields: emptyFieldStatus(),
        retry_after_seconds: 10,
      },
      { status: 503 }
    );
  }
}

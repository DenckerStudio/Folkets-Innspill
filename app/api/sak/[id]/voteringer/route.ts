import { NextResponse } from 'next/server';
import { getVoteringSummaryForSak } from '@/lib/stortinget-voteringer';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const summary = await getVoteringSummaryForSak(id);
    return NextResponse.json(summary);
  } catch (e) {
    console.error('Voteringer API error:', e);
    return NextResponse.json({ error: 'Kunne ikke hente voteringer' }, { status: 500 });
  }
}

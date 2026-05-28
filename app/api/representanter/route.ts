import { NextResponse } from 'next/server';
import { getRepresentanterForPeriode } from '@/lib/stortinget';
import { STORTINGET_ACTIVE_PERIODE_ID } from '@/lib/stortinget-config';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const periode = searchParams.get('periode') || STORTINGET_ACTIVE_PERIODE_ID;

  const representanter = await getRepresentanterForPeriode(periode);
  return NextResponse.json({ periode, representanter });
}


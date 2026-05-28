import { NextResponse } from 'next/server';
import { getSaksganger } from '@/lib/stortinget';

export const dynamic = 'force-dynamic';

export async function GET() {
  const saksganger = await getSaksganger();
  return NextResponse.json({ saksganger });
}


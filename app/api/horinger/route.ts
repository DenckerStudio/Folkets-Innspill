import { NextResponse } from 'next/server';
import { STORTINGET_ACTIVE_SESSION_ID } from '@/lib/stortinget-config';
import { getHoringer } from '@/lib/stortinget';

export async function GET(request: Request) {
  try {
    const sesjonId = new URL(request.url).searchParams.get('sesjonId') ?? STORTINGET_ACTIVE_SESSION_ID;
    const horinger_liste = await getHoringer(sesjonId);
    return NextResponse.json({ horinger_liste, sesjon_id: sesjonId });
  } catch (error) {
    console.error('Høringer API error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

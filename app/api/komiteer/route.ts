import { NextResponse } from 'next/server';
import { getKomiteer } from '@/lib/stortinget';

export async function GET(request: Request) {
  const sesjonId = new URL(request.url).searchParams.get('sesjonId') ?? undefined;
  try {
    const komiteer = await getKomiteer(sesjonId);
    return NextResponse.json({ komiteer });
  } catch (e) {
    return NextResponse.json({ error: 'Kunne ikke hente komiteer' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getVedtak } from '@/lib/stortinget';

export async function GET(request: Request) {
  const sesjonId = new URL(request.url).searchParams.get('sesjonId') ?? undefined;
  try {
    const vedtak = await getVedtak(sesjonId);
    return NextResponse.json({ vedtak });
  } catch (e) {
    return NextResponse.json({ error: 'Kunne ikke hente vedtak' }, { status: 500 });
  }
}

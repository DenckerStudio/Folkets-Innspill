import { NextResponse } from 'next/server';
import { getEnkeltsporsmal } from '@/lib/stortinget';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const sporsmal = await getEnkeltsporsmal(id);
    if (!sporsmal) {
      return NextResponse.json({ error: 'Spørsmål ikke funnet' }, { status: 404 });
    }
    return NextResponse.json(sporsmal);
  } catch (e) {
    return NextResponse.json({ error: 'Kunne ikke hente spørsmål' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getKodetBiografi, getPerson, getRepresentanter } from '@/lib/stortinget';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const [person, biografi, representanter] = await Promise.all([
      getPerson(id),
      getKodetBiografi(id),
      getRepresentanter(),
    ]);

    const representant = representanter.find((r) => r.id === id) ?? null;

    if (!person && !representant) {
      return NextResponse.json({ error: 'Person ikke funnet' }, { status: 404 });
    }

    return NextResponse.json({ person, biografi, representant });
  } catch (e) {
    return NextResponse.json({ error: 'Kunne ikke hente representant' }, { status: 500 });
  }
}

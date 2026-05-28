import { NextResponse } from 'next/server';
import { getHoringDetail, getHoringsinnspill, getHoringsprogram } from '@/lib/stortinget';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const horing = await getHoringDetail(id);
    if (!horing) {
      return NextResponse.json({ error: 'Høring ikke funnet' }, { status: 404 });
    }

    const [program, offisielleInnspill] = await Promise.all([
      getHoringsprogram(id),
      getHoringsinnspill(id),
    ]);

    return NextResponse.json({ horing, program, offisielleInnspill });
  } catch (e) {
    console.error('Høring detail API error:', e);
    return NextResponse.json({ error: 'Kunne ikke hente høring' }, { status: 500 });
  }
}

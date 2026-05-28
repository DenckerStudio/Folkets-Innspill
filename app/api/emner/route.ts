import { NextResponse } from 'next/server';
import { getEmner } from '@/lib/stortinget';

export async function GET() {
  try {
    const emner = await getEmner();
    return NextResponse.json({ emner });
  } catch (e) {
    return NextResponse.json({ error: 'Kunne ikke hente emner' }, { status: 500 });
  }
}

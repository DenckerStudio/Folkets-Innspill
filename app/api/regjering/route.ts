import { NextResponse } from 'next/server';
import { getRegjering } from '@/lib/stortinget';

export async function GET() {
  try {
    const regjering = await getRegjering();
    return NextResponse.json({ regjering });
  } catch (e) {
    return NextResponse.json({ error: 'Kunne ikke hente regjering' }, { status: 500 });
  }
}

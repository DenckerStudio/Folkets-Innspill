import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://data.stortinget.no/eksport/horinger?format=json', {
      next: { revalidate: 3600 }
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

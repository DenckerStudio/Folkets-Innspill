import { NextResponse } from 'next/server';
import { getMoter, getSakPlannedDates } from '@/lib/stortinget';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sesjonId = url.searchParams.get('sesjonId') ?? undefined;
  const includePlanned = url.searchParams.get('planned') === '1';

  try {
    const moter = await getMoter(sesjonId);
    const plannedDates = includePlanned ? await getSakPlannedDates(sesjonId) : undefined;
    return NextResponse.json({ moter, plannedDates });
  } catch (e) {
    return NextResponse.json({ error: 'Kunne ikke hente møter' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { computeValgomatScores } from '@/lib/valgomat/scores';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 });
  }

  try {
    const scores = await computeValgomatScores(user.id);
    const voteCount = scores[0]?.compared_issues ?? 0;
    return NextResponse.json({ scores, vote_count: voteCount });
  } catch (e) {
    console.error('valgomat', e);
    return NextResponse.json({ error: 'Kunne ikke beregne valgomat' }, { status: 500 });
  }
}

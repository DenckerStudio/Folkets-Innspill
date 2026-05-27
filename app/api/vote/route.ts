import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

type VoteChoice = 'for' | 'against' | 'abstain';

function parseTotals(data: unknown) {
  if (!data || typeof data !== 'object') {
    return { for: 0, against: 0, abstain: 0, total: 0 };
  }
  const t = data as Record<string, number>;
  const forCount = t.for ?? 0;
  const againstCount = t.against ?? 0;
  const abstainCount = t.abstain ?? 0;
  return {
    for: forCount,
    against: againstCount,
    abstain: abstainCount,
    total: t.total ?? forCount + againstCount + abstainCount,
  };
}

export async function POST(request: Request) {
  try {
    const { issueId, vote, title, summary } = await request.json();

    if (!issueId || !vote) {
      return NextResponse.json({ error: 'Mangler saks-ID eller stemme' }, { status: 400 });
    }

    if (!['for', 'against', 'abstain'].includes(vote)) {
      return NextResponse.json({ error: 'Ugyldig stemmetype' }, { status: 400 });
    }

    const supabase = await getServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Du må være logget inn for å stemme' }, { status: 401 });
    }

    const service = getServiceSupabase();
    const { data, error } = await service.rpc('cast_vote', {
      p_user_id: user.id,
      p_issue_id: String(issueId),
      p_choice: vote as VoteChoice,
      p_title: title || null,
      p_summary: summary || null,
    });

    if (error) {
      if (error.message?.includes('Already voted')) {
        return NextResponse.json({ error: 'Du har allerede stemt på denne saken' }, { status: 409 });
      }
      if (error.message?.includes('Identity not verified')) {
        return NextResponse.json({ error: 'Din identitet er ikke verifisert ennå' }, { status: 403 });
      }
      console.error('Vote RPC error:', error);
      return NextResponse.json({ error: 'Kunne ikke registrere stemme' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Stemme registrert anonymt',
      totals: parseTotals(data),
      userVote: vote,
    });
  } catch (error) {
    console.error('Voting Error:', error);
    return NextResponse.json({ error: 'Kunne ikke registrere stemme' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const issueId = url.searchParams.get('issueId');

  if (!issueId) {
    return NextResponse.json({ error: 'Mangler saks-ID' }, { status: 400 });
  }

  try {
    const service = getServiceSupabase();
    const { data: totalsData, error: totalsError } = await service.rpc('get_issue_vote_totals', {
      p_issue_id: issueId,
    });

    const totals = totalsError ? { for: 0, against: 0, abstain: 0, total: 0 } : parseTotals(totalsData);

    const supabase = await getServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    let userVote: VoteChoice | null = null;
    let hasVoted = false;

    if (user) {
      const { data: userData } = await service.rpc('get_user_vote_on_issue', {
        p_user_id: user.id,
        p_issue_id: issueId,
      });
      if (userData && typeof userData === 'object') {
        const u = userData as { hasVoted?: boolean; vote?: VoteChoice };
        hasVoted = Boolean(u.hasVoted);
        if (u.vote && ['for', 'against', 'abstain'].includes(u.vote)) {
          userVote = u.vote;
        }
      }
    }

    return NextResponse.json({ ...totals, hasVoted, userVote });
  } catch (error) {
    console.error('Error fetching vote totals:', error);
    return NextResponse.json({ for: 0, against: 0, abstain: 0, total: 0, hasVoted: false, userVote: null });
  }
}

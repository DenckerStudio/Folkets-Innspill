import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { getServiceSupabase } from '@/lib/supabase';
import {
  compareUserVoteToParty,
  computeValgomatScores,
  getVoteringSummaryForSak,
  type PartyVoteSummary,
} from '@/lib/stortinget-voteringer';

export const dynamic = 'force-dynamic';

type VoteRow = {
  stortinget_issue_id: string;
  title?: string;
  choice?: string;
};

export async function GET() {
  try {
    const supabase = await getServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ scores: [], comparedIssues: 0 });
    }

    const service = getServiceSupabase();
    const { data, error } = await service.rpc('get_user_vote_history_with_choices', {
      p_user_id: user.id,
    });

    if (error) {
      console.error('Valgomat vote history error:', error);
      return NextResponse.json({ scores: [], comparedIssues: 0 });
    }

    const votes = (Array.isArray(data) ? data : []) as VoteRow[];
    const comparisons: Array<{
      party: PartyVoteSummary;
      result: 'agree' | 'disagree' | 'skipped';
    }> = [];

    let comparedIssues = 0;

    for (const vote of votes.slice(0, 30)) {
      const choice = vote.choice;
      if (choice !== 'for' && choice !== 'against' && choice !== 'abstain') continue;

      const { main } = await getVoteringSummaryForSak(vote.stortinget_issue_id);
      if (!main?.partyBreakdown?.length) continue;

      comparedIssues += 1;
      for (const party of main.partyBreakdown) {
        comparisons.push({
          party,
          result: compareUserVoteToParty(choice, party.majority),
        });
      }
    }

    const scores = computeValgomatScores(comparisons);

    return NextResponse.json({ scores, comparedIssues, totalVotes: votes.length });
  } catch (e) {
    console.error('Valgomat API error:', e);
    return NextResponse.json({ error: 'Kunne ikke beregne Valgomat' }, { status: 500 });
  }
}

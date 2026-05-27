import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { issueId, vote, title, summary } = await request.json();

    if (!issueId || !vote) {
      return NextResponse.json({ error: 'Mangler saks-ID eller stemme' }, { status: 400 });
    }

    if (!['for', 'against', 'abstain'].includes(vote)) {
      return NextResponse.json({ error: 'Ugyldig stemmetype' }, { status: 400 });
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Du må være logget inn for å stemme' }, { status: 401 });
    }

    const supabase = getServiceSupabase();
    const { data, error } = await supabase.rpc('cast_vote', {
      p_user_id: session.user.id,
      p_issue_id: issueId,
      p_choice: vote,
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
      totals: data
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
    const supabase = getServiceSupabase();
    const { data, error } = await supabase.rpc('get_issue_vote_totals', {
      p_issue_id: issueId,
    });

    if (error) {
      console.error('Vote totals error:', error);
      return NextResponse.json({ for: 0, against: 0, abstain: 0 });
    }

    return NextResponse.json(data || { for: 0, against: 0, abstain: 0 });
  } catch (error) {
    console.error('Error fetching vote totals:', error);
    return NextResponse.json({ for: 0, against: 0, abstain: 0 });
  }
}

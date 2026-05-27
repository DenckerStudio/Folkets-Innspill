import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Ikke logget inn' }, { status: 401 });
    }

    const { stortinget_issue_id, content } = await request.json();
    if (!stortinget_issue_id || !content?.trim()) {
      return NextResponse.json({ error: 'Mangler påkrevde felt' }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    
    const { data: profile } = await supabase
      .from('politician_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Ikke verifisert politiker' }, { status: 403 });
    }

    const { error } = await supabase.from('politician_responses').insert({
      stortinget_issue_id,
      politician_profile_id: profile.id,
      content: content.trim(),
    });

    if (error) {
      console.error('Politician response error:', error);
      return NextResponse.json({ error: 'Kunne ikke publisere svar' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Politician response error:', error);
    return NextResponse.json({ error: 'En feil oppstod' }, { status: 500 });
  }
}

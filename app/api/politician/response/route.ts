import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabase = await getServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ikke logget inn' }, { status: 401 });
    }

    const { stortinget_issue_id, content } = await request.json();
    if (!stortinget_issue_id || !content?.trim()) {
      return NextResponse.json({ error: 'Mangler påkrevde felt' }, { status: 400 });
    }

    const service = getServiceSupabase();
    const { data: profile } = await service
      .from('politician_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Ikke verifisert politiker' }, { status: 403 });
    }

    const { error } = await service.from('politician_responses').insert({
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

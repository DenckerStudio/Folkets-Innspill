import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Du må være logget inn' }, { status: 401 });
    }

    const { action, ...payload } = await request.json();
    const supabase = getServiceSupabase();

    if (action === 'create_thread') {
      const { data, error } = await supabase.rpc('create_forum_thread', {
        p_user_id: session.user.id,
        p_title: payload.title,
        p_body: payload.body,
        p_stortinget_issue_id: payload.stortinget_issue_id || null,
      });
      if (error) {
        console.error('Create thread error:', error);
        return NextResponse.json({ error: 'Kunne ikke opprette tråd' }, { status: 500 });
      }
      return NextResponse.json({ success: true, threadId: data });
    }

    if (action === 'create_reply') {
      const { data, error } = await supabase.rpc('create_forum_reply', {
        p_user_id: session.user.id,
        p_thread_id: payload.thread_id,
        p_body: payload.body,
        p_parent_reply_id: payload.parent_reply_id || null,
        p_is_official_response: payload.is_official_response || false,
      });
      if (error) {
        console.error('Create reply error:', error);
        return NextResponse.json({ error: 'Kunne ikke publisere svar' }, { status: 500 });
      }
      return NextResponse.json({ success: true, replyId: data });
    }

    if (action === 'toggle_like') {
      const { target_type, target_id } = payload;
      const { data: existing } = await supabase
        .from('forum_likes')
        .select('user_id')
        .eq('user_id', session.user.id)
        .eq('target_type', target_type)
        .eq('target_id', target_id)
        .single();

      if (existing) {
        await supabase
          .from('forum_likes')
          .delete()
          .eq('user_id', session.user.id)
          .eq('target_type', target_type)
          .eq('target_id', target_id);
        return NextResponse.json({ liked: false });
      } else {
        await supabase.from('forum_likes').insert({
          user_id: session.user.id,
          target_type,
          target_id,
        });
        return NextResponse.json({ liked: true });
      }
    }

    return NextResponse.json({ error: 'Ukjent handling' }, { status: 400 });
  } catch (error) {
    console.error('Forum API error:', error);
    return NextResponse.json({ error: 'En feil oppstod' }, { status: 500 });
  }
}

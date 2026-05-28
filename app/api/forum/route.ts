import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { getServiceSupabase } from '@/lib/supabase';
import { createNotification, extractMentions, resolveMentionedUserIdsByName } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabase = await getServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Du må være logget inn' }, { status: 401 });
    }

    const { action, ...payload } = await request.json();
    const service = getServiceSupabase();

    if (action === 'create_thread') {
      const { data, error } = await service.rpc('create_forum_thread', {
        p_user_id: user.id,
        p_title: payload.title,
        p_body: payload.body,
        p_stortinget_issue_id: payload.stortinget_issue_id || null,
      });
      if (error) {
        console.error('Create thread error:', error);
        return NextResponse.json({ error: 'Kunne ikke opprette tråd' }, { status: 500 });
      }

      const origin = new URL(request.url).origin;
      const threadId = data as string;

      const mentionNames = extractMentions(String(payload.body || ''));
      const mentionedUserIds = await resolveMentionedUserIdsByName(mentionNames);
      await Promise.all(
        mentionedUserIds
          .filter((id) => id !== user.id)
          .map((mentionedUserId) =>
            createNotification({
              userId: mentionedUserId,
              type: 'mention',
              channel: 'mentions',
              title: 'Du ble nevnt i en ny forumtråd',
              body: payload.title ? `Tråd: ${payload.title}` : null,
              url: `/forum/${threadId}`,
              data: { threadId, byUserId: user.id },
              origin,
            })
          )
      );

      return NextResponse.json({ success: true, threadId: data });
    }

    if (action === 'create_reply') {
      const { data, error } = await service.rpc('create_forum_reply', {
        p_user_id: user.id,
        p_thread_id: payload.thread_id,
        p_body: payload.body,
        p_parent_reply_id: payload.parent_reply_id || null,
        p_is_official_response: payload.is_official_response || false,
      });
      if (error) {
        console.error('Create reply error:', error);
        return NextResponse.json({ error: 'Kunne ikke publisere svar' }, { status: 500 });
      }

      const origin = new URL(request.url).origin;
      const threadId = String(payload.thread_id);
      const replyId = data as string;

      const { data: thread } = await service
        .from('forum_threads')
        .select('id,title,author_user_id')
        .eq('id', threadId)
        .maybeSingle();

      const recipients = new Set<string>();
      if (thread?.author_user_id && thread.author_user_id !== user.id) {
        recipients.add(thread.author_user_id);
      }

      const mentionNames = extractMentions(String(payload.body || ''));
      const mentionedUserIds = await resolveMentionedUserIdsByName(mentionNames);
      for (const mentionedUserId of mentionedUserIds) {
        if (mentionedUserId !== user.id) recipients.add(mentionedUserId);
      }

      await Promise.all(
        [...recipients].map((recipientId) => {
          const isMention = mentionedUserIds.includes(recipientId);
          return createNotification({
            userId: recipientId,
            type: isMention ? 'mention' : 'forum_reply',
            channel: isMention ? 'mentions' : 'forum',
            title: isMention ? 'Du ble nevnt i forumet' : 'Nytt svar i en tråd du følger',
            body: thread?.title ? `Tråd: ${thread.title}` : null,
            url: `/forum/${threadId}`,
            data: { threadId, replyId, byUserId: user.id },
            origin,
          });
        })
      );

      return NextResponse.json({ success: true, replyId: data });
    }

    if (action === 'toggle_like') {
      const { target_type, target_id } = payload;
      const { data: existing } = await service
        .from('forum_likes')
        .select('user_id')
        .eq('user_id', user.id)
        .eq('target_type', target_type)
        .eq('target_id', target_id)
        .single();

      if (existing) {
        await service.from('forum_likes').delete()
          .eq('user_id', user.id).eq('target_type', target_type).eq('target_id', target_id);
        return NextResponse.json({ liked: false });
      } else {
        await service.from('forum_likes').insert({ user_id: user.id, target_type, target_id });
        return NextResponse.json({ liked: true });
      }
    }

    return NextResponse.json({ error: 'Ukjent handling' }, { status: 400 });
  } catch (error) {
    console.error('Forum API error:', error);
    return NextResponse.json({ error: 'En feil oppstod' }, { status: 500 });
  }
}

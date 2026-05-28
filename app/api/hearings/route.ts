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

    const { hearing_id, body } = await request.json();
    if (!hearing_id || !body?.trim()) {
      return NextResponse.json({ error: 'Mangler påkrevde felt' }, { status: 400 });
    }

    const service = getServiceSupabase();
    const { data, error } = await service.rpc('create_hearing_comment', {
      p_user_id: user.id,
      p_hearing_id: hearing_id,
      p_body: body.trim(),
    });

    if (error) {
      console.error('Create hearing comment error:', error);
      return NextResponse.json({ error: 'Kunne ikke publisere innspill' }, { status: 500 });
    }

    const origin = new URL(request.url).origin;
    const mentionNames = extractMentions(String(body || ''));
    const mentionedUserIds = await resolveMentionedUserIdsByName(mentionNames);
    await Promise.all(
      mentionedUserIds
        .filter((id) => id !== user.id)
        .map((mentionedUserId) =>
          createNotification({
            userId: mentionedUserId,
            type: 'mention',
            channel: 'mentions',
            title: 'Du ble nevnt i et innspill',
            url: `/horinger/${hearing_id}`,
            data: { hearingId: hearing_id, commentId: data, byUserId: user.id },
            origin,
          })
        )
    );

    return NextResponse.json({ success: true, commentId: data });
  } catch (error) {
    console.error('Hearings API error:', error);
    return NextResponse.json({ error: 'En feil oppstod' }, { status: 500 });
  }
}

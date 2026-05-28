import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { getServiceSupabase } from '@/lib/supabase';
import { createNotification, extractMentions, resolveMentionedUserIdsByName } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const stortingetHoringId = new URL(request.url).searchParams.get('stortingetHoringId');
  if (!stortingetHoringId) {
    return NextResponse.json({ comments: [] });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ comments: [] });
  }

  try {
    const service = getServiceSupabase();
    const { data, error } = await service
      .from('hearing_user_comments')
      .select('id, body, created_at, author_user_id, users:author_user_id (name)')
      .eq('stortinget_horing_id', stortingetHoringId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('List hearing comments error:', error);
      return NextResponse.json({ comments: [] });
    }

    const comments = (data || []).map((c) => ({
      id: c.id,
      body: c.body,
      author: (c.users as { name?: string } | null)?.name || 'Anonym',
      createdAt: c.created_at,
    }));

    return NextResponse.json({ comments });
  } catch (e) {
    console.error('Hearings GET error:', e);
    return NextResponse.json({ comments: [] });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await getServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Du må være logget inn' }, { status: 401 });
    }

    const { stortinget_horing_id, body } = await request.json();
    if (!stortinget_horing_id || !body?.trim()) {
      return NextResponse.json({ error: 'Mangler påkrevde felt' }, { status: 400 });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Database ikke konfigurert' }, { status: 503 });
    }

    const service = getServiceSupabase();
    const { data, error } = await service
      .from('hearing_user_comments')
      .insert({
        stortinget_horing_id: String(stortinget_horing_id),
        author_user_id: user.id,
        body: body.trim(),
      })
      .select('id')
      .single();

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
            url: `/horinger/${stortinget_horing_id}`,
            data: { hearingId: stortinget_horing_id, commentId: data.id, byUserId: user.id },
            origin,
          })
        )
    );

    return NextResponse.json({ success: true, commentId: data.id });
  } catch (error) {
    console.error('Hearings API error:', error);
    return NextResponse.json({ error: 'En feil oppstod' }, { status: 500 });
  }
}

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

    const { hearing_id, body } = await request.json();
    if (!hearing_id || !body?.trim()) {
      return NextResponse.json({ error: 'Mangler påkrevde felt' }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    const { data, error } = await supabase.rpc('create_hearing_comment', {
      p_user_id: session.user.id,
      p_hearing_id: hearing_id,
      p_body: body.trim(),
    });

    if (error) {
      console.error('Create hearing comment error:', error);
      return NextResponse.json({ error: 'Kunne ikke publisere innspill' }, { status: 500 });
    }

    return NextResponse.json({ success: true, commentId: data });
  } catch (error) {
    console.error('Hearings API error:', error);
    return NextResponse.json({ error: 'En feil oppstod' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await getServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Du må være logget inn' }, { status: 401 });
    }

    const { data } = await supabase
      .from('notification_preferences')
      .select('email_enabled,email_frequency_by_channel')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!data) {
      const { data: created } = await supabase
        .from('notification_preferences')
        .insert({ user_id: user.id })
        .select('email_enabled,email_frequency_by_channel')
        .single();
      return NextResponse.json({ preferences: created });
    }

    return NextResponse.json({ preferences: data });
  } catch (e) {
    console.error('Preferences GET error', e);
    return NextResponse.json({ error: 'En feil oppstod' }, { status: 500 });
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

    const payload = await request.json();
    const email_enabled = typeof payload.email_enabled === 'boolean' ? payload.email_enabled : undefined;
    const email_frequency_by_channel =
      payload.email_frequency_by_channel && typeof payload.email_frequency_by_channel === 'object'
        ? payload.email_frequency_by_channel
        : undefined;

    const update: Record<string, unknown> = {};
    if (email_enabled !== undefined) update.email_enabled = email_enabled;
    if (email_frequency_by_channel !== undefined) update.email_frequency_by_channel = email_frequency_by_channel;

    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert({ user_id: user.id, ...update }, { onConflict: 'user_id' })
      .select('email_enabled,email_frequency_by_channel')
      .single();

    if (error) {
      console.error('Preferences update error', error);
      return NextResponse.json({ error: 'Kunne ikke lagre innstillinger' }, { status: 500 });
    }

    return NextResponse.json({ preferences: data });
  } catch (e) {
    console.error('Preferences POST error', e);
    return NextResponse.json({ error: 'En feil oppstod' }, { status: 500 });
  }
}


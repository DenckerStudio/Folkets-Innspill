import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { sendDigestEmail } from '@/lib/email/nodemailer';

export const dynamic = 'force-dynamic';

type Frequency = 'daily' | 'weekly';

function assertCronAuth(request: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    throw new Error('CRON_SECRET is not configured');
  }
  const provided = request.headers.get('x-cron-secret');
  if (!provided || provided !== expected) {
    return false;
  }
  return true;
}

function parseFrequency(url: URL): Frequency {
  const value = url.searchParams.get('frequency');
  if (value === 'weekly') return 'weekly';
  return 'daily';
}

export async function GET(request: Request) {
  try {
    if (!assertCronAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const origin = url.origin;
    const frequency = parseFrequency(url);

    const service = getServiceSupabase();

    const { data: prefs } = await service
      .from('notification_preferences')
      .select('user_id,email_enabled,email_frequency_by_channel,last_digest_sent_at_by_channel');

    let emailsSent = 0;
    let usersProcessed = 0;

    for (const p of prefs || []) {
      if (!p.email_enabled) continue;

      const freq = (p.email_frequency_by_channel || {}) as Record<string, Frequency | 'realtime'>;
      const channels = Object.entries(freq)
        .filter(([, f]) => f === frequency)
        .map(([channel]) => channel);

      if (channels.length === 0) continue;
      usersProcessed += 1;

      const userRes = await service.auth.admin.getUserById(p.user_id);
      const email = userRes.data.user?.email;
      if (!email) continue;

      const items: Array<{ title: string; url?: string | null; createdAt: string }> = [];
      const nextCursor: Record<string, string> = { ...(p.last_digest_sent_at_by_channel || {}) };

      for (const channel of channels) {
        const sinceIso = (p.last_digest_sent_at_by_channel || {})[channel] as string | undefined;
        const since = sinceIso ? new Date(sinceIso) : new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);

        const { data: notifs } = await service
          .from('notifications')
          .select('title,url,created_at')
          .eq('user_id', p.user_id)
          .eq('channel', channel)
          .gt('created_at', since.toISOString())
          .order('created_at', { ascending: false })
          .limit(50);

        for (const n of notifs || []) {
          const absoluteUrl = n.url?.startsWith('/') ? `${origin}${n.url}` : n.url;
          items.push({ title: n.title, url: absoluteUrl, createdAt: n.created_at });
        }

        nextCursor[channel] = new Date().toISOString();
      }

      await sendDigestEmail({ to: email, frequency, items });
      emailsSent += 1;

      await service
        .from('notification_preferences')
        .update({ last_digest_sent_at_by_channel: nextCursor })
        .eq('user_id', p.user_id);
    }

    return NextResponse.json({ ok: true, frequency, usersProcessed, emailsSent });
  } catch (e) {
    console.error('Cron digest error', e);
    return NextResponse.json({ error: 'Cron error' }, { status: 500 });
  }
}


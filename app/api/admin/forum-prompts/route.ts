import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { requireForumAdmin } from '@/lib/forum/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireForumAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const service = getServiceSupabase();
  const { data, error } = await service
    .from('forum_prompts')
    .select('*')
    .eq('status', 'draft')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Kunne ikke hente drafts' }, { status: 500 });
  }

  return NextResponse.json({ prompts: data || [] });
}

export async function PATCH(request: Request) {
  const auth = await requireForumAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id, status } = await request.json();
  if (!id || !['active', 'archived'].includes(status)) {
    return NextResponse.json({ error: 'Ugyldig forespørsel' }, { status: 400 });
  }

  const service = getServiceSupabase();
  const updates: Record<string, unknown> = { status };

  if (status === 'active') {
    updates.expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  }

  const { error } = await service.from('forum_prompts').update(updates).eq('id', id);

  if (error) {
    return NextResponse.json({ error: 'Kunne ikke oppdatere' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

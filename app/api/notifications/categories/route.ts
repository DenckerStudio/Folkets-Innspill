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

    const { data, error } = await supabase
      .from('notification_category_subscriptions')
      .select('category')
      .eq('user_id', user.id)
      .order('category', { ascending: true });

    if (error) {
      console.error('Categories GET error', error);
      return NextResponse.json({ error: 'Kunne ikke hente interesseområder' }, { status: 500 });
    }

    return NextResponse.json({ categories: (data || []).map((r) => r.category) });
  } catch (e) {
    console.error('Categories GET error', e);
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
    const categories = Array.isArray(payload.categories) ? payload.categories : [];
    const cleaned = [
      ...new Set(categories.map((c: unknown) => String(c).trim()).filter(Boolean)),
    ];

    const { error: delError } = await supabase
      .from('notification_category_subscriptions')
      .delete()
      .eq('user_id', user.id);
    if (delError) {
      console.error('Categories delete error', delError);
      return NextResponse.json({ error: 'Kunne ikke lagre interesseområder' }, { status: 500 });
    }

    if (cleaned.length > 0) {
      const { error: insError } = await supabase
        .from('notification_category_subscriptions')
        .insert(cleaned.map((category) => ({ user_id: user.id, category })));
      if (insError) {
        console.error('Categories insert error', insError);
        return NextResponse.json({ error: 'Kunne ikke lagre interesseområder' }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true, categories: cleaned });
  } catch (e) {
    console.error('Categories POST error', e);
    return NextResponse.json({ error: 'En feil oppstod' }, { status: 500 });
  }
}


import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json([], { status: 200 });
    }

    const supabase = getServiceSupabase();
    const { data, error } = await supabase.rpc('get_user_vote_history', {
      p_user_id: session.user.id,
    });

    if (error) {
      console.error('Vote history error:', error);
      return NextResponse.json([]);
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Vote history error:', error);
    return NextResponse.json([]);
  }
}

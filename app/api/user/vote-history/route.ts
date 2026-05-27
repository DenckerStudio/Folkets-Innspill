import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await getServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json([], { status: 200 });
    }

    const service = getServiceSupabase();
    const { data, error } = await service.rpc('get_user_vote_history', { p_user_id: user.id });
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

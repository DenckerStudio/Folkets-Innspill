import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await getServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ isVerified: false });
    }

    const service = getServiceSupabase();
    const { data } = await service
      .from('politician_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({ isVerified: !!data });
  } catch {
    return NextResponse.json({ isVerified: false });
  }
}

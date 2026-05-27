import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ isVerified: false });
    }

    const supabase = getServiceSupabase();
    const { data } = await supabase
      .from('politician_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    return NextResponse.json({ isVerified: !!data });
  } catch (error) {
    return NextResponse.json({ isVerified: false });
  }
}

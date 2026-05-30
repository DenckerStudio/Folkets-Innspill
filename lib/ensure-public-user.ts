import type { User } from '@supabase/supabase-js';
import { getServiceSupabase } from '@/lib/supabase';

function displayNameFromAuthUser(user: User): string | null {
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const candidates = [
    meta?.full_name,
    meta?.name,
    meta?.user_name,
    user.email?.split('@')[0],
  ];

  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

/**
 * Ensures a row exists in public.users for the Supabase Auth user.
 * Forum/hearing tables reference public.users, not auth.users directly.
 */
export async function ensurePublicUser(user: User): Promise<void> {
  const service = getServiceSupabase();

  const { error: rpcError } = await service.rpc('ensure_public_user', {
    p_user_id: user.id,
  });

  if (!rpcError) return;

  // Fallback if migration not applied yet
  const name = displayNameFromAuthUser(user);
  const { error: upsertError } = await service.from('users').upsert(
    {
      id: user.id,
      name,
      email: user.email ?? null,
    },
    { onConflict: 'id' }
  );

  if (upsertError) {
    console.error('ensurePublicUser failed', { rpcError, upsertError });
    throw upsertError;
  }
}

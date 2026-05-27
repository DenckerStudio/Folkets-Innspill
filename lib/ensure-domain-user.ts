import { createHash } from 'crypto';
import { getServiceSupabase } from './supabase';

export async function ensureDomainUser(user: {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
}) {
  const service = getServiceSupabase();

  await service.schema('next_auth').from('users').upsert(
    {
      id: user.id,
      name: user.user_metadata?.full_name || null,
      email: user.email || null,
      image: user.user_metadata?.avatar_url || null,
    },
    { onConflict: 'id' }
  );

  const identityHash = createHash('sha256')
    .update(`folkets-stemme:${user.id}`)
    .digest('hex');

  await service.rpc('upsert_identity_hash', {
    p_user_id: user.id,
    p_identity_hash: identityHash,
  });
}

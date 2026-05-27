# Supabase migrations

Run migrations against your Supabase project:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Or paste `supabase/migrations/*.sql` into the Supabase SQL editor.

## Voting setup

1. Apply `20260528000001_anonymous_voting.sql` (requires `pgcrypto` in the `extensions` schema — standard on Supabase). If you previously created older vote RPCs, the migration drops them first (return type changes are not allowed with `CREATE OR REPLACE` alone).
2. Set a strong pepper in the database (recommended via [Supabase Vault](https://supabase.com/docs/guides/database/vault)):

```sql
ALTER DATABASE postgres SET app.vote_encryption_secret = 'your-long-random-secret';
```

3. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in the Next.js app (server-only).

### Architecture

| Table | Purpose |
|-------|---------|
| `citizen_votes` | Anonymous ballots (`issue_id` + `choice` only) |
| `user_vote_receipts` | One row per user per issue; `choice` stored as `pgp_sym_encrypt` |
| `stortinget_issues` | Issue title/summary cache |

Aggregates are exposed via `get_issue_vote_totals` / `get_vote_totals_batch`. Direct reads on `citizen_votes` are denied by RLS.

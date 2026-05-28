-- Per-felt godkjenning for AI-sammendrag (hva / hvem / kostnad)

alter table public.issue_ai_summaries
  alter column hva drop not null,
  alter column hvem drop not null,
  alter column kostnad drop not null;

alter table public.issue_ai_summaries
  add column if not exists hva_approved_at timestamptz,
  add column if not exists hvem_approved_at timestamptz,
  add column if not exists kostnad_approved_at timestamptz;

-- Eksisterende godkjente rader: marker alle felt som godkjent
update public.issue_ai_summaries
set
  hva_approved_at = coalesce(hva_approved_at, approved_at),
  hvem_approved_at = coalesce(hvem_approved_at, approved_at),
  kostnad_approved_at = coalesce(kostnad_approved_at, approved_at)
where approved_at is not null;

comment on column public.issue_ai_summaries.hva_approved_at is
  'Set when hva text passed validation against the Stortinget source';
comment on column public.issue_ai_summaries.hvem_approved_at is
  'Set when hvem text passed validation against the Stortinget source';
comment on column public.issue_ai_summaries.kostnad_approved_at is
  'Set when kostnad text passed validation against the Stortinget source';

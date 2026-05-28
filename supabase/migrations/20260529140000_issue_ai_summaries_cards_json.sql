-- Dynamiske AI-kort (tittel + innhold) per sak
alter table public.issue_ai_summaries
  add column if not exists cards_json jsonb,
  add column if not exists cards_approved_at timestamptz;

comment on column public.issue_ai_summaries.cards_json is
  'Godkjente dynamiske oppsummeringskort: { cards, approvedCardIds }';
comment on column public.issue_ai_summaries.cards_approved_at is
  'Set when all cards in cards_json are validated against the Stortinget source';

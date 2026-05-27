-- Add columns to cache Stortinget detail data and AI summaries
ALTER TABLE public.stortinget_issues
  ADD COLUMN IF NOT EXISTS detail_json jsonb,
  ADD COLUMN IF NOT EXISTS ai_summary_json jsonb,
  ADD COLUMN IF NOT EXISTS ai_summary_generated_at timestamptz;

COMMENT ON COLUMN public.stortinget_issues.detail_json IS 'Cached full JSON response from data.stortinget.no/eksport/sak';
COMMENT ON COLUMN public.stortinget_issues.ai_summary_json IS 'Cached AI-generated summary {hva, hvem, kostnad}';
COMMENT ON COLUMN public.stortinget_issues.ai_summary_generated_at IS 'When the AI summary was last generated';

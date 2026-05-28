-- User comments on Stortinget hearings (keyed by Stortinget høring ID, not legacy hearings table)

CREATE TABLE IF NOT EXISTS public.hearing_user_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stortinget_horing_id text NOT NULL,
  author_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(trim(body)) > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hearing_user_comments_horing
  ON public.hearing_user_comments (stortinget_horing_id, created_at);

ALTER TABLE public.hearing_user_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS hearing_user_comments_select_all ON public.hearing_user_comments;
CREATE POLICY hearing_user_comments_select_all ON public.hearing_user_comments
  FOR SELECT TO authenticated, anon
  USING (true);

DROP POLICY IF EXISTS hearing_user_comments_insert_own ON public.hearing_user_comments;
CREATE POLICY hearing_user_comments_insert_own ON public.hearing_user_comments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_user_id);

CREATE OR REPLACE FUNCTION public.get_user_vote_history_with_choices(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN coalesce(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'stortinget_issue_id', r.stortinget_issue_id,
          'title', coalesce(i.title, 'Sak ' || r.stortinget_issue_id),
          'voted_at', r.voted_at,
          'choice', public.decrypt_vote_choice(p_user_id, r.choice_encrypted)
        )
        ORDER BY r.voted_at DESC
      )
      FROM public.user_vote_receipts r
      LEFT JOIN public.stortinget_issues i ON i.id = r.stortinget_issue_id
      WHERE r.user_id = p_user_id
    ),
    '[]'::jsonb
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_user_vote_history_with_choices(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_vote_history_with_choices(uuid) TO service_role;

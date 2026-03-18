
CREATE TABLE public.habit_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  habit_id text NOT NULL,
  habit_title text NOT NULL,
  completed_at date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, habit_id, completed_at)
);

ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own habit completions"
  ON public.habit_completions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own habit completions"
  ON public.habit_completions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habit completions"
  ON public.habit_completions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

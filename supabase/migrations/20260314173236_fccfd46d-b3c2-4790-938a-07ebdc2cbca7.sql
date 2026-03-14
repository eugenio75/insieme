
-- Table for multiple daily check-ins (mood, energy, bloating tracking)
CREATE TABLE public.daily_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mood integer NOT NULL,
  energy integer NOT NULL,
  bloating integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own daily checkins"
  ON public.daily_checkins FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own daily checkins"
  ON public.daily_checkins FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Index for fast queries by user and date
CREATE INDEX idx_daily_checkins_user_date ON public.daily_checkins (user_id, created_at DESC);

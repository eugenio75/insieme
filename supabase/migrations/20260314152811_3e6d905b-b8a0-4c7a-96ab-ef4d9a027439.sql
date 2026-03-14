
-- Weekly check-in table for tracking progress
CREATE TABLE public.weekly_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_number INTEGER NOT NULL,
  weight NUMERIC(5,1),
  bloating INTEGER NOT NULL CHECK (bloating >= 1 AND bloating <= 5),
  energy INTEGER NOT NULL CHECK (energy >= 1 AND energy <= 5),
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.weekly_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own weekly checkins"
  ON public.weekly_checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own weekly checkins"
  ON public.weekly_checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly checkins"
  ON public.weekly_checkins FOR UPDATE
  USING (auth.uid() = user_id);

-- Unique constraint: one check-in per week per user
CREATE UNIQUE INDEX weekly_checkins_user_week ON public.weekly_checkins (user_id, week_number);

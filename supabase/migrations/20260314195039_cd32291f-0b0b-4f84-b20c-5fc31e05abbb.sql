
-- Add fasting fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fasting_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fasting_protocol text DEFAULT '16:8';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fasting_start_hour integer DEFAULT 20;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fasting_hours integer DEFAULT 16;

-- Create fasting sessions table
CREATE TABLE public.fasting_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  target_hours integer NOT NULL DEFAULT 16,
  ended_at timestamp with time zone,
  completed boolean NOT NULL DEFAULT false,
  protocol text NOT NULL DEFAULT '16:8',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.fasting_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own fasting sessions" ON public.fasting_sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own fasting sessions" ON public.fasting_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update own fasting sessions" ON public.fasting_sessions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);


ALTER TABLE public.daily_checkins ADD COLUMN foods_eaten text[] DEFAULT '{}';

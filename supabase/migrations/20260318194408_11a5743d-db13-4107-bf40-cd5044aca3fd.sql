
ALTER TABLE public.daily_checkins 
ADD COLUMN plan_adherence text DEFAULT NULL,
ADD COLUMN off_plan_foods text[] DEFAULT '{}'::text[],
ADD COLUMN plan_foods_followed text[] DEFAULT '{}'::text[];

COMMENT ON COLUMN public.daily_checkins.plan_adherence IS 'full, partial, or none - auto-calculated from food selections';
COMMENT ON COLUMN public.daily_checkins.off_plan_foods IS 'Foods selected that were NOT in the daily plan';
COMMENT ON COLUMN public.daily_checkins.plan_foods_followed IS 'Foods selected that WERE in the daily plan';

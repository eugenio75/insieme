-- Create a trigger function that notifies supporters when a user's streak increases
CREATE OR REPLACE FUNCTION public.notify_supporters_on_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only fire when current_streak actually increases
  IF NEW.current_streak IS NOT NULL 
     AND (OLD.current_streak IS NULL OR NEW.current_streak > OLD.current_streak) THEN
    
    -- Insert a badge for each supporter (partner_id in partnerships where user_id = this user)
    INSERT INTO public.badges (from_user_id, to_user_id, badge_type)
    SELECT NEW.user_id, p.partner_id, 
      CASE 
        WHEN NEW.current_streak = 1 THEN '🌱 Ha completato il primo giorno!'
        WHEN NEW.current_streak = 7 THEN '🔥 7 giorni di fila!'
        WHEN NEW.current_streak = 14 THEN '⭐ 2 settimane consecutive!'
        WHEN NEW.current_streak = 30 THEN '🏆 Un mese intero!'
        ELSE '✅ Giorno ' || NEW.current_streak || ' completato!'
      END
    FROM public.partnerships p
    WHERE p.user_id = NEW.user_id;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger on profiles table
CREATE TRIGGER on_streak_update
  AFTER UPDATE OF current_streak ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_supporters_on_progress();

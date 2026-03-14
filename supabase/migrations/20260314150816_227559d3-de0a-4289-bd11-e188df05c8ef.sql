-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  objective TEXT DEFAULT '',
  mode TEXT DEFAULT 'solo',
  pace TEXT DEFAULT '',
  activity TEXT DEFAULT '',
  difficulty TEXT DEFAULT '',
  intolerances TEXT[] DEFAULT '{}',
  custom_intolerances TEXT[] DEFAULT '{}',
  age TEXT DEFAULT '',
  sex TEXT DEFAULT '',
  partner_name TEXT DEFAULT '',
  current_streak INTEGER DEFAULT 0,
  last_check_in_date TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Timestamp functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Partnerships table
CREATE TABLE public.partnerships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, partner_id)
);

ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their partnerships"
  ON public.partnerships FOR SELECT USING (auth.uid() = user_id OR auth.uid() = partner_id);

CREATE POLICY "Users can create partnerships"
  ON public.partnerships FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Now add partner viewing policy on profiles
CREATE POLICY "Partners can view linked profiles"
  ON public.profiles FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.partnerships p
      WHERE (p.user_id = auth.uid() AND p.partner_id = profiles.user_id)
         OR (p.partner_id = auth.uid() AND p.user_id = profiles.user_id)
    )
  );

-- Invites table
CREATE TABLE public.invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_code TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  accepted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create invites"
  ON public.invites FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can view their invites"
  ON public.invites FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = accepted_by);

CREATE POLICY "Anyone can view invites by code"
  ON public.invites FOR SELECT USING (true);

CREATE POLICY "Authenticated users can accept invites"
  ON public.invites FOR UPDATE USING (accepted_by IS NULL) WITH CHECK (auth.uid() = accepted_by);

-- Badges table
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can send badges"
  ON public.badges FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can view their badges"
  ON public.badges FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can create partnerships" ON public.partnerships;

-- Create new policy that allows both user_id and partner_id to insert
CREATE POLICY "Users can create partnerships"
ON public.partnerships
FOR INSERT
TO public
WITH CHECK (auth.uid() = user_id OR auth.uid() = partner_id);

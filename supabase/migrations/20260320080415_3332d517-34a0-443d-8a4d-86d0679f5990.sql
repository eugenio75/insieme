-- Allow recipients to see pending requests matched by their email
DROP POLICY IF EXISTS "Users can view own household connections" ON public.household_connections;
CREATE POLICY "Users can view own household connections"
ON public.household_connections
FOR SELECT
TO authenticated
USING (
  auth.uid() = from_user_id 
  OR auth.uid() = to_user_id 
  OR (status = 'pending' AND to_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);

-- Also update the UPDATE policy so recipients can accept by email match
DROP POLICY IF EXISTS "Users can update household connections they receive" ON public.household_connections;
CREATE POLICY "Users can update household connections they receive"
ON public.household_connections
FOR UPDATE
TO authenticated
USING (
  auth.uid() = from_user_id 
  OR auth.uid() = to_user_id 
  OR (status = 'pending' AND to_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);

-- Add unique constraint for upsert on member_permissions
ALTER TABLE public.member_permissions
ADD CONSTRAINT member_permissions_user_id_permission_key_unique
UNIQUE (user_id, permission_key);

-- Allow owners/admins to update other users' profiles (for job title assignment)
CREATE POLICY "Owners and admins can update profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id
  OR public.has_role(auth.uid(), 'owner')
  OR public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  auth.uid() = id
  OR public.has_role(auth.uid(), 'owner')
  OR public.has_role(auth.uid(), 'admin')
);

-- Drop the old self-only update policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

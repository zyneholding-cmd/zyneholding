
-- Allow applicants to view their own applications
CREATE POLICY "Applicants can view own applications"
ON public.business_applications
FOR SELECT
TO authenticated
USING (
  applicant_user_id = auth.uid()
  OR email = (SELECT email FROM public.profiles WHERE id = auth.uid())
);

-- Allow authenticated users to view all profiles (needed for team page, hiring, etc.)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

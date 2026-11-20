-- Require signed-in applicants and ensure every submission is tied to the caller and a published listing.
DROP POLICY IF EXISTS "Validated applications for published businesses" ON public.business_applications;
CREATE POLICY "Signed-in applications for published businesses"
ON public.business_applications
FOR INSERT TO authenticated
WITH CHECK (
  applicant_user_id = auth.uid()
  AND status = 'pending'
  AND char_length(btrim(full_name)) BETWEEN 1 AND 120
  AND char_length(email) BETWEEN 3 AND 320
  AND email ~* '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
  AND (phone IS NULL OR char_length(phone) <= 50)
  AND (position IS NULL OR char_length(position) <= 120)
  AND (cover_letter IS NULL OR char_length(cover_letter) <= 5000)
  AND COALESCE(cardinality(skills), 0) <= 40
  AND EXISTS (
    SELECT 1 FROM public.business_listings AS listing
    WHERE listing.id = business_applications.business_id
      AND listing.status = 'published'
      AND listing.owner_id <> auth.uid()
  )
);

-- Public Zyne applications are intentionally open, but cannot forge moderation state or submit malformed/unbounded values.
DROP POLICY IF EXISTS "Anyone can submit applications" ON public.job_applications;
CREATE POLICY "Public applicants can submit validated applications"
ON public.job_applications
FOR INSERT TO anon, authenticated
WITH CHECK (
  status = 'pending'
  AND admin_notes IS NULL
  AND char_length(btrim(full_name)) BETWEEN 1 AND 120
  AND char_length(email) BETWEEN 3 AND 320
  AND email ~* '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
  AND (phone IS NULL OR char_length(phone) <= 50)
  AND char_length(btrim(purpose)) BETWEEN 1 AND 2000
  AND (bio IS NULL OR char_length(bio) <= 5000)
  AND COALESCE(cardinality(skills), 0) <= 50
  AND COALESCE(cardinality(categories), 0) BETWEEN 1 AND 20
  AND experience_level IN ('beginner', 'intermediate', 'expert')
  AND (portfolio_link IS NULL OR (portfolio_link ~* '^https://[^[:space:]]+$' AND char_length(portfolio_link) <= 2048))
  AND (resume_url IS NULL OR (resume_url ~* '^https://[^[:space:]]+$' AND char_length(resume_url) <= 2048))
  AND (profile_photo_url IS NULL OR (profile_photo_url ~* '^https://[^[:space:]]+$' AND char_length(profile_photo_url) <= 2048))
  AND (hourly_rate IS NULL OR hourly_rate BETWEEN 0 AND 1000000)
  AND (availability IS NULL OR availability IN ('full-time', 'part-time', 'contract', 'freelance'))
);

-- Security-definer helper avoids recursive profile/application row-policy evaluation while revealing only team relationships.
CREATE OR REPLACE FUNCTION public.can_view_team_profile(_target_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT
    auth.uid() = _target_profile_id
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'owner'::public.app_role)
    OR EXISTS (
      SELECT 1
      FROM public.business_applications AS target_application
      JOIN public.business_applications AS viewer_application
        ON viewer_application.business_id = target_application.business_id
      WHERE target_application.applicant_user_id = _target_profile_id
        AND target_application.status = 'approved'
        AND viewer_application.applicant_user_id = auth.uid()
        AND viewer_application.status = 'approved'
    )
    OR EXISTS (
      SELECT 1
      FROM public.business_applications AS member_application
      JOIN public.business_listings AS listing
        ON listing.id = member_application.business_id
      WHERE member_application.applicant_user_id = auth.uid()
        AND member_application.status = 'approved'
        AND listing.owner_id = _target_profile_id
    )
    OR EXISTS (
      SELECT 1
      FROM public.business_applications AS target_application
      JOIN public.business_listings AS listing
        ON listing.id = target_application.business_id
      WHERE target_application.applicant_user_id = _target_profile_id
        AND target_application.status = 'approved'
        AND listing.owner_id = auth.uid()
    );
$function$;
REVOKE ALL ON FUNCTION public.can_view_team_profile(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_view_team_profile(uuid) TO authenticated;
DROP POLICY IF EXISTS "Users can view own and relevant team profiles" ON public.profiles;
CREATE POLICY "Users can view own and relevant team profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.can_view_team_profile(id));
CREATE OR REPLACE FUNCTION public.application_email_not_listing_owner(_business_id uuid, _applicant_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.business_listings AS listing
    JOIN public.profiles AS owner_profile ON owner_profile.id = listing.owner_id
    WHERE listing.id = _business_id
      AND lower(owner_profile.email) = lower(_applicant_email)
  );
$function$;
REVOKE ALL ON FUNCTION public.application_email_not_listing_owner(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.application_email_not_listing_owner(uuid, text) TO anon, authenticated;

DROP POLICY IF EXISTS "Signed-in applications for published businesses" ON public.business_applications;
CREATE POLICY "Validated applications for published businesses"
ON public.business_applications
FOR INSERT TO anon, authenticated
WITH CHECK (
  ((auth.uid() IS NULL AND applicant_user_id IS NULL) OR applicant_user_id = auth.uid())
  AND status = 'pending'
  AND char_length(btrim(full_name)) BETWEEN 1 AND 120
  AND char_length(email) BETWEEN 3 AND 320
  AND email ~* '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
  AND (phone IS NULL OR char_length(phone) <= 50)
  AND (position IS NULL OR char_length(position) <= 120)
  AND (cover_letter IS NULL OR char_length(cover_letter) <= 5000)
  AND COALESCE(cardinality(skills), 0) <= 40
  AND public.application_email_not_listing_owner(business_id, email)
  AND EXISTS (
    SELECT 1 FROM public.business_listings AS listing
    WHERE listing.id = business_applications.business_id
      AND listing.status = 'published'
      AND (auth.uid() IS NULL OR listing.owner_id <> auth.uid())
  )
);
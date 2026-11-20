-- Application attachments require authentication and are confined to the uploader's own folder.
DROP POLICY IF EXISTS "Anyone can upload application files" ON storage.objects;
CREATE POLICY "Users can upload own application files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'application-files'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

-- Let a business owner view only the profiles of people who applied to that owner's listing,
-- without making all profiles readable to every signed-in account.
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
    )
    OR EXISTS (
      SELECT 1
      FROM public.business_applications AS application
      JOIN public.business_listings AS listing
        ON listing.id = application.business_id
      WHERE application.email = (SELECT profile.email FROM public.profiles AS profile WHERE profile.id = _target_profile_id)
        AND listing.owner_id = auth.uid()
    );
$function$;
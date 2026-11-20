-- Restrict selected public application inserts to real, published opportunities and safe pending submissions.
DROP POLICY IF EXISTS "Anyone can submit business applications" ON public.business_applications;
CREATE POLICY "Validated applications for published businesses"
ON public.business_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'pending'
  AND char_length(btrim(full_name)) BETWEEN 1 AND 120
  AND char_length(email) BETWEEN 3 AND 320
  AND email ~* '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
  AND (phone IS NULL OR char_length(phone) <= 50)
  AND (position IS NULL OR char_length(position) <= 120)
  AND (cover_letter IS NULL OR char_length(cover_letter) <= 5000)
  AND COALESCE(cardinality(skills), 0) <= 40
  AND (applicant_user_id IS NULL OR applicant_user_id = auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.business_listings AS listing
    WHERE listing.id = business_applications.business_id
      AND listing.status = 'published'
      AND (auth.uid() IS NULL OR listing.owner_id <> auth.uid())
  )
);

-- Public reviews remain viewable for businesses displayed in the marketplace only.
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.business_reviews;
CREATE POLICY "Anyone can view reviews of published businesses"
ON public.business_reviews
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.business_listings AS listing
    WHERE listing.id = business_reviews.business_id
      AND listing.status = 'published'
  )
);

-- Customer records are private to their creator.
DROP POLICY IF EXISTS "Users can view all customers" ON public.customers;
DROP POLICY IF EXISTS "Users can update customers" ON public.customers;
DROP POLICY IF EXISTS "Users can delete customers" ON public.customers;
CREATE POLICY "Users can view own customers"
ON public.customers FOR SELECT TO authenticated
USING (auth.uid() = created_by);
CREATE POLICY "Users can update own customers"
ON public.customers FOR UPDATE TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can delete own customers"
ON public.customers FOR DELETE TO authenticated
USING (auth.uid() = created_by);

-- Tasks and history follow creator/assignee access.
DROP POLICY IF EXISTS "Users can view all tasks" ON public.tasks;
CREATE POLICY "Users can view assigned or created tasks"
ON public.tasks FOR SELECT TO authenticated
USING (auth.uid() = created_by OR auth.uid() = assignee_id);
DROP POLICY IF EXISTS "Users can view task history" ON public.task_history;
CREATE POLICY "Users can view history for accessible tasks"
ON public.task_history FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tasks AS task
    WHERE task.id = task_history.task_id
      AND (task.created_by = auth.uid() OR task.assignee_id = auth.uid())
  )
);

-- Only document owners or participants in the associated task can see a document.
DROP POLICY IF EXISTS "Users can view all documents" ON public.documents;
CREATE POLICY "Users can view own or assigned task documents"
ON public.documents FOR SELECT TO authenticated
USING (
  uploaded_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.tasks AS task
    WHERE task.id = documents.task_id
      AND (task.created_by = auth.uid() OR task.assignee_id = auth.uid())
  )
);

-- Profiles are visible only to the user, authorized administrators, and teammates in an approved business relationship.
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
CREATE POLICY "Users can view own and relevant team profiles"
ON public.profiles FOR SELECT TO authenticated
USING (
  id = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'owner'::public.app_role)
  OR EXISTS (
    SELECT 1
    FROM public.business_applications AS target_application
    JOIN public.business_applications AS member_application
      ON member_application.business_id = target_application.business_id
    WHERE target_application.applicant_user_id = profiles.id
      AND target_application.status = 'approved'
      AND member_application.applicant_user_id = auth.uid()
      AND member_application.status = 'approved'
  )
  OR EXISTS (
    SELECT 1
    FROM public.business_applications AS member_application
    JOIN public.business_listings AS listing
      ON listing.id = member_application.business_id
    WHERE member_application.applicant_user_id = auth.uid()
      AND member_application.status = 'approved'
      AND listing.owner_id = profiles.id
  )
  OR EXISTS (
    SELECT 1
    FROM public.business_applications AS target_application
    JOIN public.business_listings AS listing
      ON listing.id = target_application.business_id
    WHERE target_application.applicant_user_id = profiles.id
      AND target_application.status = 'approved'
      AND listing.owner_id = auth.uid()
  )
);

-- Roles are visible to their owner and administrators only.
DROP POLICY IF EXISTS "Users can view all roles" ON public.user_roles;
CREATE POLICY "Users can view own role or manage team roles"
ON public.user_roles FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'owner'::public.app_role)
);

-- Calendar entries are visible to their creator and invited attendees.
DROP POLICY IF EXISTS "Users can view all events" ON public.calendar_events;
CREATE POLICY "Users can view created or attended events"
ON public.calendar_events FOR SELECT TO authenticated
USING (auth.uid() = created_by OR auth.uid() = ANY(attendees));

-- Only the non-sensitive currency setting is available to signed-in users.
DROP POLICY IF EXISTS "Auth users can read app_settings" ON public.app_settings;
CREATE POLICY "Authenticated users can read currency setting"
ON public.app_settings FOR SELECT TO authenticated
USING (key = 'currency');

-- Product image objects are confined to the uploading user's folder for all writes.
DROP POLICY IF EXISTS "Auth users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can delete product images" ON storage.objects;
CREATE POLICY "Users can upload product images to own folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);
CREATE POLICY "Users can update product images in own folder"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
)
WITH CHECK (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);
CREATE POLICY "Users can delete product images in own folder"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);
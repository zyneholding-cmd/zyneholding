-- Fix product-images storage policies: restrict to authenticated users
DROP POLICY IF EXISTS "Anyone can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete product images" ON storage.objects;

CREATE POLICY "Auth users can upload product images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Auth users can update product images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY "Auth users can delete product images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images');
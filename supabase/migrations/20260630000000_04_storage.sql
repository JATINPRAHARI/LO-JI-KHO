/*
# Step 4: Supabase Storage for QR code images

Creates the `qrs` bucket for storing UPI QR code images.
Admin-only write, public read (so customers can see the QR on payment page).
*/

-- Create the QR storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'qrs',
  'qrs',
  true,
  5242880,  -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 5242880,
      allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

-- Allow anyone to read QR images (public bucket)
DROP POLICY IF EXISTS "qrs_select_public" ON storage.objects;
CREATE POLICY "qrs_select_public" ON storage.objects FOR SELECT
USING (bucket_id = 'qrs');

-- Allow authenticated admins to upload/update QR images
DROP POLICY IF EXISTS "qrs_insert_admin" ON storage.objects;
CREATE POLICY "qrs_insert_admin" ON storage.objects FOR INSERT
TO authenticated WITH CHECK (
  bucket_id = 'qrs' AND
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "qrs_update_admin" ON storage.objects;
CREATE POLICY "qrs_update_admin" ON storage.objects FOR UPDATE
TO authenticated USING (
  bucket_id = 'qrs' AND
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
)
WITH CHECK (
  bucket_id = 'qrs' AND
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "qrs_delete_admin" ON storage.objects;
CREATE POLICY "qrs_delete_admin" ON storage.objects FOR DELETE
TO authenticated USING (
  bucket_id = 'qrs' AND
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);

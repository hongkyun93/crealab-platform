-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('public_assets', 'public_assets', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for public_assets
-- Using specific names to avoid global conflicts with other buckets

-- 1. Allow public access to all objects in public_assets
DROP POLICY IF EXISTS "public_assets_view" ON storage.objects;
CREATE POLICY "public_assets_view"
ON storage.objects FOR SELECT
USING (bucket_id = 'public_assets');

-- 2. Allow authenticated users to upload to their own folder
DROP POLICY IF EXISTS "public_assets_upload" ON storage.objects;
CREATE POLICY "public_assets_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'public_assets' AND
    (storage.foldername(name))[1] = 'contests'
);

-- 3. Allow owners to update/delete their own objects
DROP POLICY IF EXISTS "public_assets_update" ON storage.objects;
CREATE POLICY "public_assets_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'public_assets' AND auth.uid()::text = (storage.foldername(name))[2]);

DROP POLICY IF EXISTS "public_assets_delete" ON storage.objects;
CREATE POLICY "public_assets_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'public_assets' AND auth.uid()::text = (storage.foldername(name))[2]);

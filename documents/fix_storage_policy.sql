-- ==========================================
-- FIX STORAGE POLICIES (RUN THIS IN SUPABASE SQL EDITOR)
-- ==========================================

-- 1. Ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('campaigns', 'campaigns', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing policies to remove conflicts
DROP POLICY IF EXISTS "Public Access Campaigns" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Users can Upload Campaigns" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Users can Update Campaigns" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Users can Delete Campaigns" ON storage.objects;
DROP POLICY IF EXISTS "Give me access" ON storage.objects;

-- 3. Create permissive policies for the 'campaigns' bucket

-- ALLOW READ: Everyone (Public)
CREATE POLICY "Public Access Campaigns" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'campaigns');

-- ALLOW UPLOAD: Any Authenticated User
CREATE POLICY "Authenticated Users can Upload Campaigns" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'campaigns' AND auth.role() = 'authenticated');

-- ALLOW UPDATE: Any Authenticated User (simplified for debugging)
CREATE POLICY "Authenticated Users can Update Campaigns" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'campaigns' AND auth.role() = 'authenticated');

-- ALLOW DELETE: Any Authenticated User (simplified for debugging)
CREATE POLICY "Authenticated Users can Delete Campaigns" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'campaigns' AND auth.role() = 'authenticated');

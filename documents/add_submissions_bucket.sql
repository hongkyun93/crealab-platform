-- 5.1 Submissions Bucket
-- Run this to create the 'submissions' bucket for creator file uploads

INSERT INTO storage.buckets (id, name, public)
VALUES ('submissions', 'submissions', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Reset Storage Policies for submissions
DROP POLICY IF EXISTS "Public Access Submissions" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload submissions" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update submissions" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete submissions" ON storage.objects;

-- Re-create Storage Policies
CREATE POLICY "Public Access Submissions" ON storage.objects FOR SELECT USING (bucket_id = 'submissions');
CREATE POLICY "Authenticated users can upload submissions" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'submissions' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update submissions" ON storage.objects FOR UPDATE USING (bucket_id = 'submissions' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete submissions" ON storage.objects FOR DELETE USING (bucket_id = 'submissions' AND auth.role() = 'authenticated');

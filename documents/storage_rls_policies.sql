-- ============================================
-- STORAGE RLS POLICIES FOR MESSAGE FILES
-- ============================================
-- These policies control who can upload, view, and delete files
-- Files are stored in the 'message-files' bucket

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 📤 UPLOAD: Users can only upload to their own folder
CREATE POLICY "Users can upload own message files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'message-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 📥 DOWNLOAD: Users can download files where they are sender or receiver
CREATE POLICY "Users can download sent/received message files"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'message-files' 
    AND (
        -- Owner of the file
        auth.uid()::text = (storage.foldername(name))[1]
        OR 
        -- Sender or receiver of message containing this file
        EXISTS (
            SELECT 1 FROM public.messages
            WHERE file_url = name
            AND (sender_id = auth.uid() OR receiver_id = auth.uid())
        )
    )
);

-- 🗑️ DELETE: Users can only delete their own uploaded files
CREATE POLICY "Users can delete own message files"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'message-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 📝 UPDATE: Prevent file updates (immutable)
CREATE POLICY "Prevent file updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (false);

COMMENT ON POLICY "Users can upload own message files" ON storage.objects IS 
'Allow authenticated users to upload files to their own user folder in message-files bucket';

COMMENT ON POLICY "Users can download sent/received message files" ON storage.objects IS 
'Allow users to download files they uploaded or files from messages they sent/received';

COMMENT ON POLICY "Users can delete own message files" ON storage.objects IS 
'Allow users to delete only their own uploaded files';

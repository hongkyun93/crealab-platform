-- ============================================
-- FILE ATTACHMENT SUPPORT FOR MESSAGES
-- ============================================
-- Add file attachment columns to messages table
-- This allows users to send files (images, PDFs, etc.) with messages

-- Add file-related columns to messages table
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS file_size INTEGER,
ADD COLUMN IF NOT EXISTS file_type TEXT;

-- Create index for efficient file queries
CREATE INDEX IF NOT EXISTS idx_messages_file_url 
ON public.messages(file_url) 
WHERE file_url IS NOT NULL;

-- Modify content column to allow empty text when file is attached
ALTER TABLE public.messages 
ALTER COLUMN content DROP NOT NULL;

-- Add constraint: either content or file must be present
ALTER TABLE public.messages
ADD CONSTRAINT messages_content_or_file_check
CHECK (
    (content IS NOT NULL AND content != '') 
    OR 
    (file_url IS NOT NULL AND file_url != '')
);

COMMENT ON COLUMN public.messages.file_url IS 'Path to file in Supabase Storage bucket (message-files)';
COMMENT ON COLUMN public.messages.file_name IS 'Original filename for display and download';
COMMENT ON COLUMN public.messages.file_size IS 'File size in bytes';
COMMENT ON COLUMN public.messages.file_type IS 'MIME type (e.g., image/jpeg, application/pdf)';

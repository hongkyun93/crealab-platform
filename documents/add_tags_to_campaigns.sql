-- Add tags column to campaigns table
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS tags text[];
NOTIFY pgrst, 'reload schema';

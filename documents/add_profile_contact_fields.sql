-- Add phone and address columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address text;

-- Notify PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';

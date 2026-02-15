-- Migration: Add Instagram Handle to Profiles Table
-- Description: Adds the `instagram_handle` column to the `profiles` table to resolve the TeamContext error.

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS instagram_handle TEXT;

-- Refresh Schema Cache
NOTIFY pgrst, 'reload schema';

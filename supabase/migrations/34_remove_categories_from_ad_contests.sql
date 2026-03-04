-- Remove categories column from ad_contests table
ALTER TABLE public.ad_contests DROP COLUMN IF EXISTS categories;

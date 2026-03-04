-- Migration: Add missing `name` column to `teams` table

ALTER TABLE IF EXISTS public.teams 
ADD COLUMN IF NOT EXISTS name text;

-- Since name is conceptually required for teams, but maybe existing rows don't have it,
-- we'll add it as nullable, then update existing rows to use slug, then make it NOT NULL

UPDATE public.teams SET name = slug WHERE name IS NULL;

ALTER TABLE public.teams ALTER COLUMN name SET NOT NULL;

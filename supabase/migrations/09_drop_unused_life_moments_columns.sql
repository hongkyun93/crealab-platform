-- 2026-03-02 Migration: Drop unused legacy text date columns from life_moments
-- Description: Consolidate moment_date and posting_date into moment_start_date and posting_date_exact.

-- Step 1. Data Migration (just in case there's any data in moment_date that isn't in moment_start_date)
-- Note: moment_date is text like '2026-03-01', moment_start_date is date.
UPDATE public.life_moments
SET moment_start_date = CAST(moment_date AS date)
WHERE moment_start_date IS NULL AND moment_date IS NOT NULL AND moment_date ~ '^\d{4}-\d{2}-\d{2}$';

UPDATE public.life_moments
SET posting_date_exact = CAST(posting_date AS date)
WHERE posting_date_exact IS NULL AND posting_date IS NOT NULL AND posting_date ~ '^\d{4}-\d{2}-\d{2}$';

-- Step 2. Drop the legacy columns
ALTER TABLE public.life_moments DROP COLUMN IF EXISTS moment_date;
ALTER TABLE public.life_moments DROP COLUMN IF EXISTS posting_date;

-- Step 3. Ensure any new views referencing these handle it properly (PostgREST schema cache reload)
NOTIFY pgrst, 'reload schema';

-- Add posting_date and event_date columns to campaigns table
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS event_date text;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS posting_date text;

-- Add new columns for structured data if they don't exist yet
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS budget text;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS target text;

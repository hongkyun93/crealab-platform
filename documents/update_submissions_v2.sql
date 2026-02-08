-- SQL Migration: Add second submission slot
-- For Direct Offers (Brand Proposals)
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS content_submission_url_2 text;
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS content_submission_file_url_2 text;
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS content_submission_status_2 text DEFAULT 'pending';
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS content_submission_date_2 TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS content_submission_version_2 NUMERIC(3,1) DEFAULT 0.9;

-- For Campaign Applications (Proposals)
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS content_submission_url_2 text;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS content_submission_file_url_2 text;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS content_submission_status_2 text DEFAULT 'pending';
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS content_submission_date_2 TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS content_submission_version_2 NUMERIC(3,1) DEFAULT 0.9;

-- Notify PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';

-- Add Condition Negotiation Fields to brand_proposals and proposals tables

-- For Brand Proposals (Direct Offers)
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS condition_product_receipt_date text;
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS condition_plan_sharing_date text;
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS condition_draft_submission_date text;
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS condition_final_submission_date text;
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS condition_upload_date text;
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS condition_maintenance_period text;
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS condition_secondary_usage_period text;

-- For Campaign Applications (Proposals)
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS condition_product_receipt_date text;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS condition_plan_sharing_date text;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS condition_draft_submission_date text;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS condition_final_submission_date text;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS condition_upload_date text;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS condition_maintenance_period text;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS condition_secondary_usage_period text;

-- Notify PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';

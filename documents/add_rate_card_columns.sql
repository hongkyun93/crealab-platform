-- Add Extended Rate Card columns to influencer_details table

ALTER TABLE public.influencer_details
ADD COLUMN IF NOT EXISTS price_video integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS price_feed integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS secondary_rights integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS usage_rights_month integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS usage_rights_price integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS auto_dm_month integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS auto_dm_price integer DEFAULT 0;

-- Comment on columns for clarity
COMMENT ON COLUMN public.influencer_details.price_video IS 'Short-form video production price';
COMMENT ON COLUMN public.influencer_details.price_feed IS 'Feed post production price';
COMMENT ON COLUMN public.influencer_details.secondary_rights IS 'Legacy secondary rights price';
COMMENT ON COLUMN public.influencer_details.usage_rights_month IS 'Secondary usage rights duration in months';
COMMENT ON COLUMN public.influencer_details.usage_rights_price IS 'Secondary usage rights price';
COMMENT ON COLUMN public.influencer_details.auto_dm_month IS 'Auto DM duration in months';
COMMENT ON COLUMN public.influencer_details.auto_dm_price IS 'Auto DM price';

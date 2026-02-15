
-- Migration: Add Influencer Details Columns to Profiles Table
-- Description: Moves columns previously in `influencer_details` to `profiles` to separate concerns and simplify queries.

-- Add columns if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS followers_count BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'Nano',
-- Rate Card Fields
ADD COLUMN IF NOT EXISTS price_video BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS price_feed BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS secondary_rights BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS usage_rights_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS usage_rights_price BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS auto_dm_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS auto_dm_price BIGINT DEFAULT 0;

-- Comment on columns
COMMENT ON COLUMN public.profiles.followers_count IS 'Instagram followers count';
COMMENT ON COLUMN public.profiles.tags IS 'Creator category tags';
COMMENT ON COLUMN public.profiles.price_video IS 'Video rate';

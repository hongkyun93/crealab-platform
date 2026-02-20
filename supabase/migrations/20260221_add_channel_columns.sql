-- Add channel_name and channel_subtype columns where missing
-- brand_proposals already has channel_name; add channel_subtype only
ALTER TABLE brand_proposals ADD COLUMN IF NOT EXISTS channel_subtype TEXT;

-- moment_proposals has neither
ALTER TABLE moment_proposals ADD COLUMN IF NOT EXISTS channel_name TEXT;
ALTER TABLE moment_proposals ADD COLUMN IF NOT EXISTS channel_subtype TEXT;

-- campaign_applications: ensure both exist
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS channel_name TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS channel_subtype TEXT;

-- Add secondary_usage_fee column to all proposal tables
-- This stores the cost (in KRW) for secondary content usage rights

ALTER TABLE product_applications
ADD COLUMN IF NOT EXISTS secondary_usage_fee INTEGER DEFAULT 0;

ALTER TABLE moment_proposals
ADD COLUMN IF NOT EXISTS secondary_usage_fee INTEGER DEFAULT 0;

ALTER TABLE campaign_applications
ADD COLUMN IF NOT EXISTS secondary_usage_fee INTEGER DEFAULT 0;

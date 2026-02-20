-- Add shipping columns to all 3 proposal tables
-- receiver_name: 받는 사람 (크리에이터 본인이 아닐 수 있음)
-- shipping_phone: 연락처
-- shipping_address: 주소

-- 1. brand_proposals
ALTER TABLE brand_proposals ADD COLUMN IF NOT EXISTS receiver_name TEXT;
ALTER TABLE brand_proposals ADD COLUMN IF NOT EXISTS shipping_phone TEXT;
ALTER TABLE brand_proposals ADD COLUMN IF NOT EXISTS shipping_address TEXT;

-- 2. campaign_applications
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS receiver_name TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS shipping_phone TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS shipping_address TEXT;

-- 3. moment_proposals
ALTER TABLE moment_proposals ADD COLUMN IF NOT EXISTS receiver_name TEXT;
ALTER TABLE moment_proposals ADD COLUMN IF NOT EXISTS shipping_phone TEXT;
ALTER TABLE moment_proposals ADD COLUMN IF NOT EXISTS shipping_address TEXT;

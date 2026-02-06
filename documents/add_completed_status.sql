-- Add completed_at column to brand_proposals
ALTER TABLE brand_proposals 
ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone;

-- Add completed_at column to proposals
ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone;

-- Optional: Create index for status if not exists (already partly done, but ensures 'completed' is efficient)
CREATE INDEX IF NOT EXISTS idx_brand_proposals_status ON brand_proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);

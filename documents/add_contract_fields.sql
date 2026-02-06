
-- Add contract columns to brand_proposals
ALTER TABLE brand_proposals 
ADD COLUMN IF NOT EXISTS contract_content TEXT,
ADD COLUMN IF NOT EXISTS contract_status TEXT DEFAULT 'none';

-- Add contract columns to proposals (for creator-initiated applications)
ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS contract_content TEXT,
ADD COLUMN IF NOT EXISTS contract_status TEXT DEFAULT 'none';

-- Create index for performance (optional but good practice)
CREATE INDEX IF NOT EXISTS idx_brand_proposals_contract_status ON brand_proposals(contract_status);
CREATE INDEX IF NOT EXISTS idx_proposals_contract_status ON proposals(contract_status);

-- Add signature columns
ALTER TABLE brand_proposals
ADD COLUMN IF NOT EXISTS brand_signature TEXT,
ADD COLUMN IF NOT EXISTS influencer_signature TEXT,
ADD COLUMN IF NOT EXISTS brand_signed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS influencer_signed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE proposals
ADD COLUMN IF NOT EXISTS brand_signature TEXT,
ADD COLUMN IF NOT EXISTS influencer_signature TEXT,
ADD COLUMN IF NOT EXISTS brand_signed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS influencer_signed_at TIMESTAMP WITH TIME ZONE;


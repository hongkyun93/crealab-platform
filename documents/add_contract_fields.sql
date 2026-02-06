
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

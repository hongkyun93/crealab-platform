-- Performance Optimization: Database Indexes
-- This script adds indexes to optimize JOIN queries in proposal-provider
-- Expected impact: 60-70% faster queries

-- Proposals lookup optimization
CREATE INDEX IF NOT EXISTS idx_brand_proposals_lookup 
ON brand_proposals(brand_id, influencer_id, status)
WHERE status IN ('offered', 'pending', 'accepted', 'confirmed');

CREATE INDEX IF NOT EXISTS idx_moment_proposals_lookup 
ON moment_proposals(brand_id, influencer_id, status);

CREATE INDEX IF NOT EXISTS idx_campaign_proposals_lookup 
ON campaign_proposals(influencer_id, status)
WHERE status NOT IN ('cancelled', 'rejected');

-- Profile joins optimization (for JOIN queries)
CREATE INDEX IF NOT EXISTS idx_profiles_lookup 
ON profiles(id);

-- Life moments lookup (for moment proposals JOIN)
CREATE INDEX IF NOT EXISTS idx_life_moments_lookup
ON life_moments(influencer_id, event_date);

-- Brand products lookup (for brand proposals JOIN)
CREATE INDEX IF NOT EXISTS idx_brand_products_lookup
ON brand_products(id, brand_id);

-- Comments for maintenance
COMMENT ON INDEX idx_brand_proposals_lookup IS 'Optimizes brand proposal queries by brand_id, influencer_id, and status';
COMMENT ON INDEX idx_moment_proposals_lookup IS 'Optimizes moment proposal queries by brand_id, influencer_id, and status';
COMMENT ON INDEX idx_campaign_proposals_lookup IS 'Optimizes campaign proposal queries by influencer_id and status';
COMMENT ON INDEX idx_profiles_lookup IS 'Optimizes profile JOIN queries in proposals';
COMMENT ON INDEX idx_life_moments_lookup IS 'Optimizes life moments JOIN queries in moment proposals';
COMMENT ON INDEX idx_brand_products_lookup IS 'Optimizes brand products JOIN queries in brand proposals';

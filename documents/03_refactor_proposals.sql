-- ==========================================
-- 3. MIGRATION: Proposals to Campaign Proposals
-- ==========================================
-- This script migrates data from the legacy 'proposals' table to the 'campaign_proposals' table.
-- It maps columns and ensures data integrity.

-- 3.1 Insert Data
INSERT INTO public.campaign_proposals (
    id,
    campaign_id,
    influencer_id,
    message,
    price_offer,
    status,
    created_at,
    -- Mapping additional fields if they exist in source
    motivation,
    content_plan,
    portfolio_links,
    instagram_handle,
    insight_screenshot
)
SELECT
    id,
    campaign_id::uuid, -- Ensure type cast
    influencer_id::uuid, -- Ensure type cast
    message,
    cost, -- Map 'cost' to 'price_offer'
    status,
    created_at,
    motivation,
    content_plan,
    portfolio_links,
    instagram_handle,
    insight_screenshot
FROM public.proposals
ON CONFLICT (id) DO NOTHING; -- Prevent duplicates if re-run

-- 3.2 Verify Count (Optional check)
DO $$
DECLARE
    src_count INT;
    dst_count INT;
BEGIN
    SELECT COUNT(*) INTO src_count FROM public.proposals;
    SELECT COUNT(*) INTO dst_count FROM public.campaign_proposals;
    RAISE NOTICE 'Migrated % rows from proposals. Total rows in campaign_proposals: %', src_count, dst_count;
END $$;

-- 3.3 (Optional) Rename legacy table to backup
-- ALTER TABLE public.proposals RENAME TO proposals_backup;

-- =====================================================
-- Payment Confirmation Migration
-- Created: 2026-02-22
-- Purpose: Brand must deposit before moving to shipping stage.
--           Admin confirms payment via payment_confirmed_at.
-- =====================================================

-- brand_proposals
ALTER TABLE public.brand_proposals
    ADD COLUMN IF NOT EXISTS payment_confirmed_at timestamptz DEFAULT NULL;

-- moment_proposals
ALTER TABLE public.moment_proposals
    ADD COLUMN IF NOT EXISTS payment_confirmed_at timestamptz DEFAULT NULL;

-- campaign_applications
ALTER TABLE public.campaign_applications
    ADD COLUMN IF NOT EXISTS payment_confirmed_at timestamptz DEFAULT NULL;

-- Index for admin dashboard queries (pending payment list)
CREATE INDEX IF NOT EXISTS idx_brand_proposals_payment
    ON public.brand_proposals (payment_confirmed_at, contract_status);

CREATE INDEX IF NOT EXISTS idx_moment_proposals_payment
    ON public.moment_proposals (payment_confirmed_at, contract_status);

-- =====================================================
-- Payment Confirmation Migration
-- Created: 2026-02-22
-- Purpose: Brand must deposit before moving to shipping stage.
--           Admin confirms payment via payment_confirmed_at.
-- =====================================================

-- product_applications
ALTER TABLE public.product_applications
    ADD COLUMN IF NOT EXISTS payment_confirmed_at timestamptz DEFAULT NULL;

-- moment_proposals
ALTER TABLE public.moment_proposals
    ADD COLUMN IF NOT EXISTS payment_confirmed_at timestamptz DEFAULT NULL;

-- campaign_applications
ALTER TABLE public.campaign_applications
    ADD COLUMN IF NOT EXISTS payment_confirmed_at timestamptz DEFAULT NULL;

-- Index for admin dashboard queries (pending payment list)
CREATE INDEX IF NOT EXISTS idx_product_applications_payment
    ON public.product_applications (payment_confirmed_at, contract_status);

CREATE INDEX IF NOT EXISTS idx_moment_proposals_payment
    ON public.moment_proposals (payment_confirmed_at, contract_status);

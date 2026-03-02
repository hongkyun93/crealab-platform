-- Migration: Add payment_confirmed_at to moment_proposals and campaign_applications
-- Fixes: brand_pay_from_deposit function fails on moment/campaign proposals
-- (column existed only in product_applications)

ALTER TABLE public.moment_proposals
    ADD COLUMN IF NOT EXISTS payment_confirmed_at timestamp with time zone;

ALTER TABLE public.campaign_applications
    ADD COLUMN IF NOT EXISTS payment_confirmed_at timestamp with time zone;

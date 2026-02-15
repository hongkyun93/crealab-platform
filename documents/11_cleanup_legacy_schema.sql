-- DRAFT Cleanup Script for Legacy Schema Items
-- CAUTION: Verify data before running! These operations are destructive.

-- 1. Drop Legacy/Deprecated Tables

-- [LEGACY] 'influencer_events': Replaced by 'life_moments'.
-- Check for data: SELECT COUNT(*) FROM public.influencer_events;
-- DROP TABLE IF EXISTS public.influencer_events CASCADE;

-- [DEPRECATED] 'campaign_applications': Replaced by 'campaign_proposals' (used by addProposal).
-- Check for data: SELECT COUNT(*) FROM public.campaign_applications;
-- DROP TABLE IF EXISTS public.campaign_applications CASCADE;

-- 2. Drop Legacy Columns

-- [LEGACY] 'conditions' (JSONB) in 'moment_proposals': Replaced by explicit columns (condition_product_receipt_date etc).
-- ALTER TABLE public.moment_proposals DROP COLUMN IF EXISTS conditions;

-- 3. Other potential cleanups
-- Verify if 'users' table is needed or if 'profiles' covers all use cases along with auth.users.
-- IF redundant:
-- DROP TABLE IF EXISTS public.users CASCADE;

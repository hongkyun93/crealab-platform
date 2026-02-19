-- Drop the unused campaign_proposals table
-- This table was replaced by campaign_applications but was still receiving writes incorrectly.
-- We have fixed the write path in app/actions/proposal.ts to use campaign_applications.

DROP TABLE IF EXISTS public.campaign_proposals CASCADE;

-- Add team_id columns to proposal tables
-- Based on ProposalProvider usage

-- 1. campaign_applications
ALTER TABLE public.campaign_applications 
ADD COLUMN IF NOT EXISTS influencer_team_id UUID REFERENCES public.teams(id);

CREATE INDEX IF NOT EXISTS idx_campaign_applications_influencer_team_id ON public.campaign_applications(influencer_team_id);

-- 2. brand_proposals
ALTER TABLE public.brand_proposals 
ADD COLUMN IF NOT EXISTS influencer_team_id UUID REFERENCES public.teams(id);

CREATE INDEX IF NOT EXISTS idx_brand_proposals_influencer_team_id ON public.brand_proposals(influencer_team_id);

-- 3. moment_proposals
ALTER TABLE public.moment_proposals 
ADD COLUMN IF NOT EXISTS brand_team_id UUID REFERENCES public.teams(id);

CREATE INDEX IF NOT EXISTS idx_moment_proposals_brand_team_id ON public.moment_proposals(brand_team_id);

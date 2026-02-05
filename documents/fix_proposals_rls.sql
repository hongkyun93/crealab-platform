-- 🛠️ FIX PROPOSALS TABLE RLS (For Creator Applications)
-- Run this in Supabase SQL Editor

-- 1. Enable RLS on 'proposals' table
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- 2. RESET POLICIES
DROP POLICY IF EXISTS "Anyone can read proposals" ON proposals;
DROP POLICY IF EXISTS "Creators can apply to campaigns" ON proposals;
DROP POLICY IF EXISTS "Brands can update application status" ON proposals;
DROP POLICY IF EXISTS "Users can view their own proposals" ON proposals;

-- A. VIEW POLICY: 
-- Creator can see their own applications, Brand can see applications for their campaigns
CREATE POLICY "Users can view their own proposals" ON public.proposals
FOR SELECT USING (
    auth.uid() = influencer_id 
    OR 
    EXISTS (
        SELECT 1 FROM campaigns 
        WHERE campaigns.id = proposals.campaign_id 
        AND campaigns.brand_id = auth.uid()
    )
);

-- B. INSERT POLICY: 
-- Any authenticated creator can apply (insert)
CREATE POLICY "Creators can apply to campaigns" ON public.proposals
FOR INSERT WITH CHECK (
    auth.uid() = influencer_id
);

-- C. UPDATE POLICY: 
-- Brand can update status, Creator can update (e.g., cancel) if needed
CREATE POLICY "Parties can update proposals" ON public.proposals
FOR UPDATE USING (
    auth.uid() = influencer_id 
    OR 
    EXISTS (
        SELECT 1 FROM campaigns 
        WHERE campaigns.id = proposals.campaign_id 
        AND campaigns.brand_id = auth.uid()
    )
);

-- D. DELETE POLICY:
-- Creator can withdraw their application
CREATE POLICY "Creators can delete their applications" ON public.proposals
FOR DELETE USING (
    auth.uid() = influencer_id
);

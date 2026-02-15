
-- 1. Update RLS for life_moments (Allow Team Owners/Admins to manage)
DROP POLICY IF EXISTS "Influencer manage moments" ON public.life_moments;

CREATE POLICY "Influencer manage moments" ON public.life_moments FOR ALL USING (
    auth.uid() = influencer_id 
    OR 
    EXISTS (
        SELECT 1 FROM team_members tm_influencer
        JOIN team_members tm_auth ON tm_influencer.team_id = tm_auth.team_id
        WHERE tm_influencer.user_id = life_moments.influencer_id
        AND tm_auth.user_id = auth.uid()
        AND tm_auth.role IN ('owner', 'admin')
    )
);

-- 2. Update RLS for campaign_proposals INSERT (Allow Team Owners/Admins to apply)
DROP POLICY IF EXISTS "Campaign proposals insert" ON public.campaign_proposals;

CREATE POLICY "Campaign proposals insert" ON public.campaign_proposals FOR INSERT WITH CHECK (
    auth.uid() = influencer_id
    OR 
    EXISTS (
        SELECT 1 FROM team_members tm_influencer
        JOIN team_members tm_auth ON tm_influencer.team_id = tm_auth.team_id
        WHERE tm_influencer.user_id = campaign_proposals.influencer_id
        AND tm_auth.user_id = auth.uid()
        AND tm_auth.role IN ('owner', 'admin')
    )
);

-- 3. Update RLS for campaign_proposals VIEW (Allow Team Owners/Admins to view)
DROP POLICY IF EXISTS "Campaign proposals view" ON public.campaign_proposals;

CREATE POLICY "Campaign proposals view" ON public.campaign_proposals FOR SELECT USING (
    auth.uid() = influencer_id 
    OR 
    EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_proposals.campaign_id AND c.brand_id = auth.uid())
    OR
    EXISTS (
        SELECT 1 FROM team_members tm_influencer
        JOIN team_members tm_auth ON tm_influencer.team_id = tm_auth.team_id
        WHERE tm_influencer.user_id = campaign_proposals.influencer_id
        AND tm_auth.user_id = auth.uid()
        AND tm_auth.role IN ('owner', 'admin')
    )
);

-- 4. Update RLS for campaign_proposals UPDATE (Allow Team Owners/Admins to update)
DROP POLICY IF EXISTS "Campaign proposals update" ON public.campaign_proposals;

CREATE POLICY "Campaign proposals update" ON public.campaign_proposals FOR UPDATE USING (
    auth.uid() = influencer_id 
    OR 
    EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_proposals.campaign_id AND c.brand_id = auth.uid())
    OR
    EXISTS (
        SELECT 1 FROM team_members tm_influencer
        JOIN team_members tm_auth ON tm_influencer.team_id = tm_auth.team_id
        WHERE tm_influencer.user_id = campaign_proposals.influencer_id
        AND tm_auth.user_id = auth.uid()
        AND tm_auth.role IN ('owner', 'admin')
    )
);

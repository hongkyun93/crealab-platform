
-- Update RLS for brand_proposals to allow MCN/Agency Proxy Actions

-- 1. INSERT (Allow Brand, Creator, OR their Team Owners/Admins to insert)
DROP POLICY IF EXISTS "Brand proposals insert" ON public.brand_proposals;

CREATE POLICY "Brand proposals insert" ON public.brand_proposals FOR INSERT WITH CHECK (
    -- Case A: Self (Brand or Influencer)
    auth.uid() = brand_id 
    OR 
    auth.uid() = influencer_id
    
    -- Case B: Brand Team Proxy (Agency acting for Brand)
    OR EXISTS (
        SELECT 1 FROM team_members tm_brand
        JOIN team_members tm_auth ON tm_brand.team_id = tm_auth.team_id
        WHERE tm_brand.user_id = brand_proposals.brand_id
        AND tm_auth.user_id = auth.uid()
        AND tm_auth.role IN ('owner', 'admin')
    )
    
    -- Case C: Creator Team Proxy (MCN acting for Creator - The Fix)
    OR EXISTS (
        SELECT 1 FROM team_members tm_influencer
        JOIN team_members tm_auth ON tm_influencer.team_id = tm_auth.team_id
        WHERE tm_influencer.user_id = brand_proposals.influencer_id
        AND tm_auth.user_id = auth.uid()
        AND tm_auth.role IN ('owner', 'admin')
    )
);

-- 2. SELECT (Allow participants and their team managers to view)
DROP POLICY IF EXISTS "Brand proposals view" ON public.brand_proposals;

CREATE POLICY "Brand proposals view" ON public.brand_proposals FOR SELECT USING (
    -- Participants
    auth.uid() = brand_id 
    OR 
    auth.uid() = influencer_id
    
    -- Managers (Brand side)
    OR EXISTS (
        SELECT 1 FROM team_members tm_brand
        JOIN team_members tm_auth ON tm_brand.team_id = tm_auth.team_id
        WHERE tm_brand.user_id = brand_proposals.brand_id
        AND tm_auth.user_id = auth.uid()
        AND tm_auth.role IN ('owner', 'admin')
    )
    
    -- Managers (Creator side)
    OR EXISTS (
        SELECT 1 FROM team_members tm_influencer
        JOIN team_members tm_auth ON tm_influencer.team_id = tm_auth.team_id
        WHERE tm_influencer.user_id = brand_proposals.influencer_id
        AND tm_auth.user_id = auth.uid()
        AND tm_auth.role IN ('owner', 'admin')
    )
);

-- 3. UPDATE (Allow participants and their team managers to update)
DROP POLICY IF EXISTS "Brand proposals update" ON public.brand_proposals;

CREATE POLICY "Brand proposals update" ON public.brand_proposals FOR UPDATE USING (
    -- Participants
    auth.uid() = brand_id 
    OR 
    auth.uid() = influencer_id
    
    -- Managers (Brand side)
    OR EXISTS (
        SELECT 1 FROM team_members tm_brand
        JOIN team_members tm_auth ON tm_brand.team_id = tm_auth.team_id
        WHERE tm_brand.user_id = brand_proposals.brand_id
        AND tm_auth.user_id = auth.uid()
        AND tm_auth.role IN ('owner', 'admin')
    )
    
    -- Managers (Creator side)
    OR EXISTS (
        SELECT 1 FROM team_members tm_influencer
        JOIN team_members tm_auth ON tm_influencer.team_id = tm_auth.team_id
        WHERE tm_influencer.user_id = brand_proposals.influencer_id
        AND tm_auth.user_id = auth.uid()
        AND tm_auth.role IN ('owner', 'admin')
    )
);

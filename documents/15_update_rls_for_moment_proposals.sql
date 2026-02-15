
-- Update RLS for moment_proposals to allow MCN/Agency Proxy Actions

-- 1. INSERT (Allow Brand, Creator, OR their Team Owners/Admins to insert/propose)
-- Although typically Brands initiate calls to Moments, Creators might need to counter-propose or MCNs might manage it.
DROP POLICY IF EXISTS "Moment proposals insert" ON public.moment_proposals;

CREATE POLICY "Moment proposals insert" ON public.moment_proposals FOR INSERT WITH CHECK (
    -- Case A: Self
    auth.uid() = brand_id 
    OR 
    auth.uid() = influencer_id
    
    -- Case B: Brand Team Proxy
    OR EXISTS (
        SELECT 1 FROM team_members tm_brand
        JOIN team_members tm_auth ON tm_brand.team_id = tm_auth.team_id
        WHERE tm_brand.user_id = moment_proposals.brand_id
        AND tm_auth.user_id = auth.uid()
        AND tm_auth.role IN ('owner', 'admin')
    )
    
    -- Case C: Creator Team Proxy
    OR EXISTS (
        SELECT 1 FROM team_members tm_influencer
        JOIN team_members tm_auth ON tm_influencer.team_id = tm_auth.team_id
        WHERE tm_influencer.user_id = moment_proposals.influencer_id
        AND tm_auth.user_id = auth.uid()
        AND tm_auth.role IN ('owner', 'admin')
    )
);

-- 2. SELECT
DROP POLICY IF EXISTS "Moment proposals view" ON public.moment_proposals;

CREATE POLICY "Moment proposals view" ON public.moment_proposals FOR SELECT USING (
    -- Case A: Self
    auth.uid() = brand_id 
    OR 
    auth.uid() = influencer_id
    
    -- Case B: Brand Team Proxy
    OR EXISTS (
        SELECT 1 FROM team_members tm_brand
        JOIN team_members tm_auth ON tm_brand.team_id = tm_auth.team_id
        WHERE tm_brand.user_id = moment_proposals.brand_id
        AND tm_auth.user_id = auth.uid()
        AND tm_auth.role IN ('owner', 'admin')
    )
    
    -- Case C: Creator Team Proxy
    OR EXISTS (
        SELECT 1 FROM team_members tm_influencer
        JOIN team_members tm_auth ON tm_influencer.team_id = tm_auth.team_id
        WHERE tm_influencer.user_id = moment_proposals.influencer_id
        AND tm_auth.user_id = auth.uid()
        AND tm_auth.role IN ('owner', 'admin')
    )
);

-- 3. UPDATE (Accept/Reject/Negotiate)
DROP POLICY IF EXISTS "Moment proposals update" ON public.moment_proposals;

CREATE POLICY "Moment proposals update" ON public.moment_proposals FOR UPDATE USING (
    -- Case A: Self
    auth.uid() = brand_id 
    OR 
    auth.uid() = influencer_id
    
    -- Case B: Brand Team Proxy
    OR EXISTS (
        SELECT 1 FROM team_members tm_brand
        JOIN team_members tm_auth ON tm_brand.team_id = tm_auth.team_id
        WHERE tm_brand.user_id = moment_proposals.brand_id
        AND tm_auth.user_id = auth.uid()
        AND tm_auth.role IN ('owner', 'admin')
    )
    
    -- Case C: Creator Team Proxy
    OR EXISTS (
        SELECT 1 FROM team_members tm_influencer
        JOIN team_members tm_auth ON tm_influencer.team_id = tm_auth.team_id
        WHERE tm_influencer.user_id = moment_proposals.influencer_id
        AND tm_auth.user_id = auth.uid()
        AND tm_auth.role IN ('owner', 'admin')
    )
);

-- 4. DELETE (Cancel)
DROP POLICY IF EXISTS "Moment proposals delete" ON public.moment_proposals;

CREATE POLICY "Moment proposals delete" ON public.moment_proposals FOR DELETE USING (
     -- Case A: Self
    auth.uid() = brand_id 
    OR 
    auth.uid() = influencer_id
    
    -- Case B: Brand Team Proxy
    OR EXISTS (
        SELECT 1 FROM team_members tm_brand
        JOIN team_members tm_auth ON tm_brand.team_id = tm_auth.team_id
        WHERE tm_brand.user_id = moment_proposals.brand_id
        AND tm_auth.user_id = auth.uid()
        AND tm_auth.role IN ('owner', 'admin')
    )
    
    -- Case C: Creator Team Proxy
    OR EXISTS (
        SELECT 1 FROM team_members tm_influencer
        JOIN team_members tm_auth ON tm_influencer.team_id = tm_auth.team_id
        WHERE tm_influencer.user_id = moment_proposals.influencer_id
        AND tm_auth.user_id = auth.uid()
        AND tm_auth.role IN ('owner', 'admin')
    )
);

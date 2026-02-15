-- Fix MCN Permissions for life_moments

-- 1. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Influencer manage moments" ON public.life_moments;
DROP POLICY IF EXISTS "Influencer insert moments" ON public.life_moments;
DROP POLICY IF EXISTS "Influencer update moments" ON public.life_moments;
DROP POLICY IF EXISTS "Influencer delete moments" ON public.life_moments;

-- 2. CREATE (INSERT)
CREATE POLICY "Influencer insert moments" ON public.life_moments FOR INSERT WITH CHECK (
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

-- 3. READ (SELECT)
CREATE POLICY "Influencer select moments" ON public.life_moments FOR SELECT USING (
    auth.uid() = influencer_id 
    OR 
    is_private = false
    OR
    EXISTS (
        SELECT 1 FROM team_members tm_influencer
        JOIN team_members tm_auth ON tm_influencer.team_id = tm_auth.team_id
        WHERE tm_influencer.user_id = life_moments.influencer_id
        AND tm_auth.user_id = auth.uid()
        AND tm_auth.role IN ('owner', 'admin')
    )
);

-- 4. UPDATE
CREATE POLICY "Influencer update moments" ON public.life_moments FOR UPDATE USING (
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

-- 5. DELETE
CREATE POLICY "Influencer delete moments" ON public.life_moments FOR DELETE USING (
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

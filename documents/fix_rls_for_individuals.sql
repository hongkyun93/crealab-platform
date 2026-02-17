-- FIX RLS FOR INDIVIDUALS (Owner Fallback) - MASTER VERSION COMPATIBLE
-- This script patches the existing policies defined in 00_master_schema.sql.
-- It keeps the SAME POLICY NAMES but updates the logic to allow:
-- 1. Team Access (existing logic)
-- OR
-- 2. Owner Access (new logic for users without teams)

-- ==========================================
-- 1. CAMPAIGNS
-- ==========================================
DROP POLICY IF EXISTS "Team manage campaigns" ON public.campaigns;
CREATE POLICY "Team manage campaigns" ON public.campaigns FOR ALL USING (
    -- Individual Owner
    brand_id = auth.uid() 
    OR
    -- Team Member
    team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);

-- ==========================================
-- 2. PRODUCTS
-- ==========================================
DROP POLICY IF EXISTS "Team manage products" ON public.brand_products;
CREATE POLICY "Team manage products" ON public.brand_products FOR ALL USING (
    -- Individual Owner
    brand_id = auth.uid()
    OR
    -- Team Member
    team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);

-- ==========================================
-- 3. MOMENTS (Events)
-- ==========================================
-- Note: Master schema Section 11 already has this logic, but Section 9 is stricter.
-- We enforce the permissible logic here using the standard policy name.
DROP POLICY IF EXISTS "Team manage moments" ON public.life_moments;
CREATE POLICY "Team manage moments" ON public.life_moments FOR ALL USING (
    -- Individual Owner
    influencer_id = auth.uid()
    OR
    -- Team Member
    team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);

-- ==========================================
-- 4. PROPOSALS
-- ==========================================

-- 4.1 Brand Proposals
DROP POLICY IF EXISTS "Team proposals update" ON public.brand_proposals;
CREATE POLICY "Team proposals update" ON public.brand_proposals FOR UPDATE USING (
    -- User is directly involved
    brand_id = auth.uid() OR influencer_id = auth.uid()
    OR
    -- User's team is involved
    brand_team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
    OR
    influencer_team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Team proposals insert" ON public.brand_proposals;
CREATE POLICY "Team proposals insert" ON public.brand_proposals FOR INSERT WITH CHECK (
    -- User is directly involved
    brand_id = auth.uid() OR influencer_id = auth.uid()
    OR
    -- User's team is involved
    brand_team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
    OR
    influencer_team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);


-- 4.2 Campaign Proposals (Applications)
DROP POLICY IF EXISTS "Team campaign proposals update" ON public.campaign_proposals;
CREATE POLICY "Team campaign proposals update" ON public.campaign_proposals FOR UPDATE USING (
    -- User is directly involved (Influencer applying or Brand owning campaign)
    influencer_id = auth.uid()
    OR
    EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_proposals.campaign_id AND c.brand_id = auth.uid())
    OR
    -- User's team is involved
    influencer_team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_proposals.campaign_id AND c.team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()))
);

DROP POLICY IF EXISTS "Team campaign proposals insert" ON public.campaign_proposals;
CREATE POLICY "Team campaign proposals insert" ON public.campaign_proposals FOR INSERT WITH CHECK (
    -- User is directly involved
    influencer_id = auth.uid()
    OR
    -- User's team is involved
    influencer_team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);


-- 4.3 Moment Proposals
DROP POLICY IF EXISTS "Team moment proposals update" ON public.moment_proposals;
CREATE POLICY "Team moment proposals update" ON public.moment_proposals FOR UPDATE USING (
    -- User is directly involved
    brand_id = auth.uid() OR influencer_id = auth.uid()
    OR
    -- User's team is involved
    brand_team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
    OR
    influencer_team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Team moment proposals insert" ON public.moment_proposals;
CREATE POLICY "Team moment proposals insert" ON public.moment_proposals FOR INSERT WITH CHECK (
    -- User is directly involved
    brand_id = auth.uid()
    OR
    -- User's team is involved
    brand_team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Team moment proposals delete" ON public.moment_proposals;
CREATE POLICY "Team moment proposals delete" ON public.moment_proposals FOR DELETE USING (
    -- User is directly involved
    brand_id = auth.uid() OR influencer_id = auth.uid()
    OR
    -- User's team is involved
    brand_team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
    OR
    influencer_team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);

-- Notify schema reload
NOTIFY pgrst, 'reload schema';

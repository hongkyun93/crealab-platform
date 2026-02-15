-- Enable MCN (Team) Access to Resources

-- 1. Helper Function to check if user has access to a team
-- (Already exists as get_user_team_ids, but let's make a boolean check for RLS to use efficiently)
CREATE OR REPLACE FUNCTION public.user_belongs_to_team(target_team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = target_team_id
    AND user_id = auth.uid()
  );
$$;

-- 2. Life Moments RLS (Team Access)
-- DROP existing policies to replace with broader ones
DROP POLICY IF EXISTS "Influencer manage moments" ON public.life_moments;
DROP POLICY IF EXISTS "Public life_moments" ON public.life_moments;

-- 2.1 View Policy
CREATE POLICY "Team view moments" ON public.life_moments
FOR SELECT USING (
  is_private = false 
  OR auth.uid() = influencer_id
  OR (team_id IS NOT NULL AND public.user_belongs_to_team(team_id))
);

-- 2.2 Insert Policy (Allow Team Members)
CREATE POLICY "Team insert moments" ON public.life_moments
FOR INSERT WITH CHECK (
  auth.uid() = influencer_id
  OR (team_id IS NOT NULL AND public.user_belongs_to_team(team_id))
);

-- 2.3 Update Policy
CREATE POLICY "Team update moments" ON public.life_moments
FOR UPDATE USING (
  auth.uid() = influencer_id
  OR (team_id IS NOT NULL AND public.user_belongs_to_team(team_id))
);

-- 2.4 Delete Policy
CREATE POLICY "Team delete moments" ON public.life_moments
FOR DELETE USING (
  auth.uid() = influencer_id
  OR (team_id IS NOT NULL AND public.user_belongs_to_team(team_id))
);


-- 3. Campaigns RLS (Team Access)
DROP POLICY IF EXISTS "Brand manage campaigns" ON public.campaigns;

-- 3.1 View Policy (Already public for Select, but Manage needs All)
CREATE POLICY "Team receive and manage campaigns" ON public.campaigns
FOR ALL USING (
  auth.uid() = brand_id
  OR (team_id IS NOT NULL AND public.user_belongs_to_team(team_id))
);


-- 4. Proposals RLS
-- 4.1 Campaign Proposals
-- Existing: Implicitly none? Or "Self view"?
-- Let's check master schema: No specific RLS for campaign_proposals listed in snippet above, 
-- but likely has basic policies. We'll add/replace Team policies.

DROP POLICY IF EXISTS "Team view campaign_proposals" ON public.campaign_proposals;
CREATE POLICY "Team view campaign_proposals" ON public.campaign_proposals
FOR SELECT USING (
  -- As Brand Team
  EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_proposals.campaign_id
    AND (c.brand_id = auth.uid() OR (c.team_id IS NOT NULL AND public.user_belongs_to_team(c.team_id)))
  )
  OR
  -- As Influencer Team (MCN)
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.user_id = campaign_proposals.influencer_id
    AND tm.team_id IN (SELECT public.get_user_team_ids(auth.uid()))
  )
  OR
  auth.uid() = influencer_id
);

DROP POLICY IF EXISTS "Team manage campaign_proposals" ON public.campaign_proposals;
CREATE POLICY "Team manage campaign_proposals" ON public.campaign_proposals
FOR ALL USING (
  -- Same logic for Update/Insert/Delete
  -- As Brand Team
  EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_proposals.campaign_id
    AND (c.brand_id = auth.uid() OR (c.team_id IS NOT NULL AND public.user_belongs_to_team(c.team_id)))
  )
  OR
  -- As Influencer Team
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.user_id = campaign_proposals.influencer_id
    AND tm.team_id IN (SELECT public.get_user_team_ids(auth.uid()))
  )
  OR
  auth.uid() = influencer_id
);

-- 4.2 Moment Proposals
DROP POLICY IF EXISTS "Team view moment_proposals" ON public.moment_proposals;
CREATE POLICY "Team view moment_proposals" ON public.moment_proposals
FOR SELECT USING (
  -- As Brand Team (Buyer) -> Check brand_id ownership? 
  -- Moment proposals have brand_id.
  (brand_id = auth.uid()) OR
  EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.user_id = moment_proposals.brand_id 
      AND tm.team_id IN (SELECT public.get_user_team_ids(auth.uid()))
  )
  OR
  -- As Influencer Team (Seller/MCN) -> Check Moment or Influencer
  (influencer_id = auth.uid()) OR
  EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.user_id = moment_proposals.influencer_id 
      AND tm.team_id IN (SELECT public.get_user_team_ids(auth.uid()))
  )
);

DROP POLICY IF EXISTS "Team manage moment_proposals" ON public.moment_proposals;
CREATE POLICY "Team manage moment_proposals" ON public.moment_proposals
FOR ALL USING (
   -- As Brand Team
  (brand_id = auth.uid()) OR
  EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.user_id = moment_proposals.brand_id 
      AND tm.team_id IN (SELECT public.get_user_team_ids(auth.uid()))
  )
  OR
  -- As Influencer Team
  (influencer_id = auth.uid()) OR
  EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.user_id = moment_proposals.influencer_id 
      AND tm.team_id IN (SELECT public.get_user_team_ids(auth.uid()))
  )
);

-- 4.3 Brand Proposals (Direct Offers)
DROP POLICY IF EXISTS "Team manage brand_proposals" ON public.brand_proposals;
CREATE POLICY "Team manage brand_proposals" ON public.brand_proposals
FOR ALL USING (
   -- As Brand Team
  (brand_id = auth.uid()) OR
  EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.user_id = brand_proposals.brand_id 
      AND tm.team_id IN (SELECT public.get_user_team_ids(auth.uid()))
  )
  OR
  -- As Influencer Team
  (influencer_id = auth.uid()) OR
  EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.user_id = brand_proposals.influencer_id 
      AND tm.team_id IN (SELECT public.get_user_team_ids(auth.uid()))
  )
);

-- ==========================================
-- 11. MCN Proxy Support & Team Permissions
-- ==========================================

-- 1. Update RLS for life_moments to allow team members to INSERT/UPDATE for their team's influencers
DROP POLICY IF EXISTS "Influencer manage moments" ON public.life_moments;
DROP POLICY IF EXISTS "Team manage moments" ON public.life_moments;

-- Allow SELECT for everyone (public moments) or own team's private moments
CREATE POLICY "Public view moments" ON public.life_moments FOR SELECT USING (
    is_private = false OR 
    auth.uid() = influencer_id OR
    team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()) OR 
    EXISTS (SELECT 1 FROM public.team_members WHERE user_id = influencer_id AND team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()))
);

-- Allow INSERT if user is the influencer OR a member of the same team as the influencer
CREATE POLICY "Team manage moments" ON public.life_moments FOR ALL USING (
    auth.uid() = influencer_id OR
    team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);

-- 2. Update RLS for campaign_applications to allow proxy application
ALTER TABLE public.campaign_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Influencer manage applications" ON public.campaign_applications;
DROP POLICY IF EXISTS "Team manage applications" ON public.campaign_applications;

CREATE POLICY "Team manage applications" ON public.campaign_applications FOR ALL USING (
    auth.uid() = applicant_id OR
    EXISTS (SELECT 1 FROM public.team_members WHERE user_id = applicant_id AND team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()))
);

-- 3. Update RLS for Workspaces (if used) or ensure Channel access
-- Assuming we use a flexible relation for workspaces/channels. 
-- For now, let's ensure team members can access workspaces where their team created it.

-- Notify schema reload
NOTIFY pgrst, 'reload schema';

-- ==========================================
-- GRAND UNIFICATION: Fix ALL RLS Policies
-- ==========================================
-- Migration Date: 2026-02-20
-- Issue: Multiple tables use raw `SELECT team_id FROM team_members` subqueries 
--        which trigger team_members RLS recursion and cause slow queries.
--        Also, `profiles` may have a recursive SELECT policy causing joins to hang.
-- Solution: Replace ALL raw subqueries with safe `get_user_team_ids(auth.uid())` 
--           which bypasses RLS via SECURITY DEFINER.
-- 
-- Tables Fixed:
--   1. profiles         (SELECT, INSERT, UPDATE)
--   2. brand_products    (SELECT, ALL)
--   3. campaigns         (ALL)
--   4. life_moments      (SELECT, ALL)
--   5. brand_proposals   (SELECT, INSERT, UPDATE)
--   6. moment_proposals  (SELECT, INSERT, UPDATE, DELETE)
--   7. campaign_applications (ALL)
--   8. messages          (SELECT, INSERT)
--   9. notifications     (SELECT, INSERT)
--  10. submission_feedback (SELECT, INSERT)
--  11. favorites         (SELECT, INSERT, DELETE)
--  12. teams             (SELECT, INSERT, UPDATE)
-- ==========================================

-- ==========================================
-- 0. ENSURE HELPER FUNCTIONS EXIST
-- ==========================================
-- (Safe to re-create; these were defined in fix_team_members_rls.sql)

CREATE OR REPLACE FUNCTION public.get_user_team_ids(target_user_id UUID)
RETURNS SETOF UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
VOLATILE
AS $$
BEGIN
    SET LOCAL row_security = off;
    RETURN QUERY 
    SELECT team_id 
    FROM public.team_members 
    WHERE user_id = target_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_team_owner_or_admin(target_team_id UUID, target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
VOLATILE
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SET LOCAL row_security = off;
    
    SELECT role INTO user_role
    FROM public.team_members
    WHERE team_id = target_team_id AND user_id = target_user_id
    LIMIT 1;
    
    RETURN (user_role = 'owner' OR user_role = 'admin');
END;
$$;

-- ==========================================
-- 1. PROFILES
-- ==========================================
-- Frontend queries:
--   brand_products.select(*, profiles(...))
--   life_moments.select(*, profiles(*))
--   campaigns.select(*, profiles(...))
--   brand_proposals.select(*, brand:profiles!brand_id(...), influencer:profiles!influencer_id(...))
--   moment_proposals.select(*, brand:profiles!brand_id(...), influencer:profiles!influencer_id(...))
--   campaign_applications.select(*, profiles!influencer_id(...))
-- 
-- Requirement: profiles must be readable by ALL authenticated users (for joins to work).

-- Drop ALL existing policies on profiles (nuclear clean)
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
END $$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: All authenticated users can read profiles (names, avatars for joins)
CREATE POLICY "profiles_select_authenticated"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- INSERT: Only self (triggered by handle_new_user or manual signup)
CREATE POLICY "profiles_insert_self"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- UPDATE: Self OR team manager (MCN proxy support)
CREATE POLICY "profiles_update_self_or_manager"
ON public.profiles FOR UPDATE
TO authenticated
USING (
    auth.uid() = id
    OR
    -- MCN managers can update team members' profiles
    id IN (
        SELECT tm_target.user_id 
        FROM public.team_members tm_target
        WHERE tm_target.team_id IN (SELECT public.get_user_team_ids(auth.uid()))
    )
    AND public.is_team_owner_or_admin(
        (SELECT tm2.team_id FROM public.team_members tm2 WHERE tm2.user_id = profiles.id LIMIT 1),
        auth.uid()
    )
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- ==========================================
-- 2. BRAND_PRODUCTS
-- ==========================================
-- Frontend queries:
--   useProductsSWR: select(*, profiles(display_name, avatar_url))  [ALL products]
--   addProduct: insert({...}).select().single()
--   updateProduct: update({...}).eq('id', id)
--   deleteProduct: delete().eq('id', id)

DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'brand_products' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.brand_products', pol.policyname);
    END LOOP;
END $$;

ALTER TABLE public.brand_products ENABLE ROW LEVEL SECURITY;

-- SELECT: All authenticated users can browse products (creator discovery)
CREATE POLICY "products_select_authenticated"
ON public.brand_products FOR SELECT
TO authenticated
USING (true);

-- INSERT: Only team members of the owning team
CREATE POLICY "products_insert_team"
ON public.brand_products FOR INSERT
TO authenticated
WITH CHECK (
    team_id IN (SELECT public.get_user_team_ids(auth.uid()))
    OR auth.uid() = brand_id
);

-- UPDATE: Only team members of the owning team
CREATE POLICY "products_update_team"
ON public.brand_products FOR UPDATE
TO authenticated
USING (
    team_id IN (SELECT public.get_user_team_ids(auth.uid()))
    OR auth.uid() = brand_id
);

-- DELETE: Only team members of the owning team
CREATE POLICY "products_delete_team"
ON public.brand_products FOR DELETE
TO authenticated
USING (
    team_id IN (SELECT public.get_user_team_ids(auth.uid()))
    OR auth.uid() = brand_id
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.brand_products TO authenticated;

-- ==========================================
-- 3. CAMPAIGNS
-- ==========================================
-- Frontend queries:
--   fetchCampaigns: select(*, profiles(display_name, avatar_url)).eq('team_id', teamId)
--   createCampaign: server action
--   updateCampaignStatus: server action
--   deleteCampaign: server action

DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'campaigns' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.campaigns', pol.policyname);
    END LOOP;
END $$;

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- SELECT: All authenticated users can browse campaigns (creator discovery)
CREATE POLICY "campaigns_select_authenticated"
ON public.campaigns FOR SELECT
TO authenticated
USING (true);

-- INSERT: Brand owner or team member
CREATE POLICY "campaigns_insert_team"
ON public.campaigns FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = brand_id
    OR team_id IN (SELECT public.get_user_team_ids(auth.uid()))
);

-- UPDATE: Brand owner or team member
CREATE POLICY "campaigns_update_team"
ON public.campaigns FOR UPDATE
TO authenticated
USING (
    auth.uid() = brand_id
    OR team_id IN (SELECT public.get_user_team_ids(auth.uid()))
);

-- DELETE: Brand owner or team member
CREATE POLICY "campaigns_delete_team"
ON public.campaigns FOR DELETE
TO authenticated
USING (
    auth.uid() = brand_id
    OR team_id IN (SELECT public.get_user_team_ids(auth.uid()))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;

-- ==========================================
-- 4. LIFE_MOMENTS
-- ==========================================
-- Frontend queries:
--   fetchUserEvents: select(*, profiles(*)).eq('influencer_id', userId) OR .eq('team_id', teamId)
--   fetchPublicEvents: select(*, profiles(*, social_channels(*))).eq('is_private', false)
--   addEvent: insert({...}).select().single()
--   updateEvent: update({...}).eq('id', id)
--   deleteEvent: delete().eq('id', id)

DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'life_moments' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.life_moments', pol.policyname);
    END LOOP;
END $$;

ALTER TABLE public.life_moments ENABLE ROW LEVEL SECURITY;

-- SELECT: Public moments are visible to all; private moments only to owner/team
CREATE POLICY "moments_select"
ON public.life_moments FOR SELECT
TO authenticated
USING (
    is_private = false
    OR auth.uid() = influencer_id
    OR team_id IN (SELECT public.get_user_team_ids(auth.uid()))
);

-- INSERT: Owner or team member
CREATE POLICY "moments_insert"
ON public.life_moments FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = influencer_id
    OR team_id IN (SELECT public.get_user_team_ids(auth.uid()))
);

-- UPDATE: Owner or team member
CREATE POLICY "moments_update"
ON public.life_moments FOR UPDATE
TO authenticated
USING (
    auth.uid() = influencer_id
    OR team_id IN (SELECT public.get_user_team_ids(auth.uid()))
);

-- DELETE: Owner or team member
CREATE POLICY "moments_delete"
ON public.life_moments FOR DELETE
TO authenticated
USING (
    auth.uid() = influencer_id
    OR team_id IN (SELECT public.get_user_team_ids(auth.uid()))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.life_moments TO authenticated;

-- ==========================================
-- 5. BRAND_PROPOSALS
-- ==========================================
-- Frontend queries:
--   fetchBrandProposals: select(*, brand:profiles!brand_id(...), influencer:profiles!influencer_id(...), products:brand_products(...))
--                        .or(`brand_id.eq.${id},influencer_id.eq.${id}`)

DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'brand_proposals' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.brand_proposals', pol.policyname);
    END LOOP;
END $$;

ALTER TABLE public.brand_proposals ENABLE ROW LEVEL SECURITY;

-- SELECT: Brand or Influencer involved, or their team members
CREATE POLICY "brand_proposals_select"
ON public.brand_proposals FOR SELECT
TO authenticated
USING (
    auth.uid() = brand_id
    OR auth.uid() = influencer_id
    OR brand_team_id IN (SELECT public.get_user_team_ids(auth.uid()))
    OR influencer_team_id IN (SELECT public.get_user_team_ids(auth.uid()))
);

-- INSERT: Brand or their team
CREATE POLICY "brand_proposals_insert"
ON public.brand_proposals FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = brand_id
    OR brand_team_id IN (SELECT public.get_user_team_ids(auth.uid()))
);

-- UPDATE: Either side
CREATE POLICY "brand_proposals_update"
ON public.brand_proposals FOR UPDATE
TO authenticated
USING (
    auth.uid() = brand_id
    OR auth.uid() = influencer_id
    OR brand_team_id IN (SELECT public.get_user_team_ids(auth.uid()))
    OR influencer_team_id IN (SELECT public.get_user_team_ids(auth.uid()))
);

-- DELETE: Brand or their team
CREATE POLICY "brand_proposals_delete"
ON public.brand_proposals FOR DELETE
TO authenticated
USING (
    auth.uid() = brand_id
    OR brand_team_id IN (SELECT public.get_user_team_ids(auth.uid()))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.brand_proposals TO authenticated;

-- ==========================================
-- 6. MOMENT_PROPOSALS
-- ==========================================
-- Frontend queries:
--   fetchBrandProposals: select(*, brand:profiles!brand_id(...), influencer:profiles!influencer_id(...), moment:life_moments(...))
--                        .or(`brand_id.eq.${id},influencer_id.eq.${id}`)

DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'moment_proposals' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.moment_proposals', pol.policyname);
    END LOOP;
END $$;

ALTER TABLE public.moment_proposals ENABLE ROW LEVEL SECURITY;

-- SELECT: Brand or Influencer involved, or their team members
CREATE POLICY "moment_proposals_select"
ON public.moment_proposals FOR SELECT
TO authenticated
USING (
    auth.uid() = brand_id
    OR auth.uid() = influencer_id
    OR brand_team_id IN (SELECT public.get_user_team_ids(auth.uid()))
    OR influencer_team_id IN (SELECT public.get_user_team_ids(auth.uid()))
);

-- INSERT: Brand or their team
CREATE POLICY "moment_proposals_insert"
ON public.moment_proposals FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = brand_id
    OR brand_team_id IN (SELECT public.get_user_team_ids(auth.uid()))
);

-- UPDATE: Either side
CREATE POLICY "moment_proposals_update"
ON public.moment_proposals FOR UPDATE
TO authenticated
USING (
    auth.uid() = brand_id
    OR auth.uid() = influencer_id
    OR brand_team_id IN (SELECT public.get_user_team_ids(auth.uid()))
    OR influencer_team_id IN (SELECT public.get_user_team_ids(auth.uid()))
);

-- DELETE: Either side
CREATE POLICY "moment_proposals_delete"
ON public.moment_proposals FOR DELETE
TO authenticated
USING (
    auth.uid() = brand_id
    OR auth.uid() = influencer_id
    OR brand_team_id IN (SELECT public.get_user_team_ids(auth.uid()))
    OR influencer_team_id IN (SELECT public.get_user_team_ids(auth.uid()))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.moment_proposals TO authenticated;

-- ==========================================
-- 7. CAMPAIGN_APPLICATIONS
-- ==========================================
-- Frontend queries:
--   fetchCampaignProposals: select(*, campaigns(..., profiles(...)), profiles!influencer_id(...))
--                           .eq('influencer_id', id) OR .eq('campaigns.brand_id', id)

DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'campaign_applications' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.campaign_applications', pol.policyname);
    END LOOP;
END $$;

ALTER TABLE public.campaign_applications ENABLE ROW LEVEL SECURITY;

-- SELECT: Influencer who applied, or brand who owns the campaign, or their team members
CREATE POLICY "campaign_apps_select"
ON public.campaign_applications FOR SELECT
TO authenticated
USING (
    auth.uid() = influencer_id
    OR influencer_team_id IN (SELECT public.get_user_team_ids(auth.uid()))
    OR EXISTS (
        SELECT 1 FROM public.campaigns c 
        WHERE c.id = campaign_applications.campaign_id 
        AND (
            c.brand_id = auth.uid()
            OR c.team_id IN (SELECT public.get_user_team_ids(auth.uid()))
        )
    )
);

-- INSERT: Influencer or their team (MCN proxy)
CREATE POLICY "campaign_apps_insert"
ON public.campaign_applications FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = influencer_id
    OR influencer_team_id IN (SELECT public.get_user_team_ids(auth.uid()))
);

-- UPDATE: Either side
CREATE POLICY "campaign_apps_update"
ON public.campaign_applications FOR UPDATE
TO authenticated
USING (
    auth.uid() = influencer_id
    OR influencer_team_id IN (SELECT public.get_user_team_ids(auth.uid()))
    OR EXISTS (
        SELECT 1 FROM public.campaigns c 
        WHERE c.id = campaign_applications.campaign_id 
        AND (
            c.brand_id = auth.uid()
            OR c.team_id IN (SELECT public.get_user_team_ids(auth.uid()))
        )
    )
);

-- DELETE: Influencer or their team
CREATE POLICY "campaign_apps_delete"
ON public.campaign_applications FOR DELETE
TO authenticated
USING (
    auth.uid() = influencer_id
    OR influencer_team_id IN (SELECT public.get_user_team_ids(auth.uid()))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_applications TO authenticated;

-- ==========================================
-- 8. MESSAGES
-- ==========================================
-- Frontend queries:
--   fetchMessages: select(*).or(`sender_id.eq.${id},receiver_id.eq.${id}`)

DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'messages' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.messages', pol.policyname);
    END LOOP;
END $$;

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- SELECT: Sender or Receiver
CREATE POLICY "messages_select"
ON public.messages FOR SELECT
TO authenticated
USING (
    auth.uid() = sender_id
    OR auth.uid() = receiver_id
);

-- INSERT: Sender must be self
CREATE POLICY "messages_insert"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

-- UPDATE: Receiver can mark as read
CREATE POLICY "messages_update"
ON public.messages FOR UPDATE
TO authenticated
USING (auth.uid() = receiver_id);

GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;

-- ==========================================
-- 9. NOTIFICATIONS
-- ==========================================

DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'notifications' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.notifications', pol.policyname);
    END LOOP;
END $$;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- SELECT: Recipient only
CREATE POLICY "notifications_select"
ON public.notifications FOR SELECT
TO authenticated
USING (auth.uid() = recipient_id);

-- INSERT: Authenticated users can create notifications
CREATE POLICY "notifications_insert"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- UPDATE: Recipient can mark as read
CREATE POLICY "notifications_update"
ON public.notifications FOR UPDATE
TO authenticated
USING (auth.uid() = recipient_id);

GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;

-- ==========================================
-- 10. SUBMISSION_FEEDBACK
-- ==========================================

DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'submission_feedback' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.submission_feedback', pol.policyname);
    END LOOP;
END $$;

ALTER TABLE public.submission_feedback ENABLE ROW LEVEL SECURITY;

-- SELECT: Participants of the proposal
CREATE POLICY "feedback_select"
ON public.submission_feedback FOR SELECT
TO authenticated
USING (
    auth.uid() = sender_id
    OR EXISTS (
        SELECT 1 FROM public.brand_proposals bp 
        WHERE bp.id = submission_feedback.brand_proposal_id 
        AND (bp.brand_id = auth.uid() OR bp.influencer_id = auth.uid())
    )
    OR EXISTS (
        SELECT 1 FROM public.campaign_applications ca 
        WHERE ca.id = submission_feedback.proposal_id 
        AND (ca.influencer_id = auth.uid())
    )
);

-- INSERT: Authenticated users
CREATE POLICY "feedback_insert"
ON public.submission_feedback FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

GRANT SELECT, INSERT ON public.submission_feedback TO authenticated;

-- ==========================================
-- 11. FAVORITES
-- ==========================================
-- Frontend queries:
--   fetchFavorites: select(*).eq('user_id', id)

DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'favorites' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.favorites', pol.policyname);
    END LOOP;
END $$;

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- SELECT: Own favorites only
CREATE POLICY "favorites_select"
ON public.favorites FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- INSERT: Self only
CREATE POLICY "favorites_insert"
ON public.favorites FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- DELETE: Self only
CREATE POLICY "favorites_delete"
ON public.favorites FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;

-- ==========================================
-- 12. TEAMS (Ensure safe policy)
-- ==========================================

DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'teams' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.teams', pol.policyname);
    END LOOP;
END $$;

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- SELECT: Members can view their teams
CREATE POLICY "teams_select"
ON public.teams FOR SELECT
TO authenticated
USING (
    created_by = auth.uid()
    OR id IN (SELECT public.get_user_team_ids(auth.uid()))
);

-- INSERT: Any authenticated user can create a team
CREATE POLICY "teams_insert"
ON public.teams FOR INSERT
TO authenticated
WITH CHECK (true);

-- UPDATE: Only the creator or owner/admin
CREATE POLICY "teams_update"
ON public.teams FOR UPDATE
TO authenticated
USING (
    created_by = auth.uid()
    OR public.is_team_owner_or_admin(id, auth.uid())
);

GRANT SELECT, INSERT, UPDATE ON public.teams TO authenticated;

-- ==========================================
-- 13. INSTAGRAM_ACCOUNTS
-- ==========================================

DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'instagram_accounts' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.instagram_accounts', pol.policyname);
    END LOOP;
END $$;

ALTER TABLE public.instagram_accounts ENABLE ROW LEVEL SECURITY;

-- SELECT: Self only
CREATE POLICY "instagram_select"
ON public.instagram_accounts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- INSERT: Self only
CREATE POLICY "instagram_insert"
ON public.instagram_accounts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Self only
CREATE POLICY "instagram_update"
ON public.instagram_accounts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE ON public.instagram_accounts TO authenticated;

-- ==========================================
-- 14. TEAM_INVITATIONS (Ensure safe policy)
-- ==========================================

DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'team_invitations' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.team_invitations', pol.policyname);
    END LOOP;
END $$;

ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- SELECT: Own email or team member
CREATE POLICY "invitations_select"
ON public.team_invitations FOR SELECT
TO authenticated
USING (
    email = (auth.jwt() ->> 'email')
    OR team_id IN (SELECT public.get_user_team_ids(auth.uid()))
);

-- INSERT: Team managers
CREATE POLICY "invitations_insert"
ON public.team_invitations FOR INSERT
TO authenticated
WITH CHECK (
    public.is_team_owner_or_admin(team_id, auth.uid())
);

-- UPDATE: Team managers
CREATE POLICY "invitations_update"
ON public.team_invitations FOR UPDATE
TO authenticated
USING (
    public.is_team_owner_or_admin(team_id, auth.uid())
);

-- DELETE: Team managers
CREATE POLICY "invitations_delete"
ON public.team_invitations FOR DELETE
TO authenticated
USING (
    public.is_team_owner_or_admin(team_id, auth.uid())
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_invitations TO authenticated;

-- ==========================================
-- 15. SOCIAL_CHANNELS (if table exists)
-- ==========================================
-- Frontend queries: life_moments.select(*, profiles(*, social_channels(*)))
-- social_channels is joined via profiles, so it needs public read access

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'social_channels') THEN
        -- Drop existing policies
        DECLARE
            pol record;
        BEGIN
            FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'social_channels' AND schemaname = 'public' LOOP
                EXECUTE format('DROP POLICY IF EXISTS %I ON public.social_channels', pol.policyname);
            END LOOP;
        END;
        
        EXECUTE 'ALTER TABLE public.social_channels ENABLE ROW LEVEL SECURITY';
        
        -- SELECT: All authenticated users can read (needed for profile joins)
        EXECUTE 'CREATE POLICY "social_channels_select" ON public.social_channels FOR SELECT TO authenticated USING (true)';
        
        -- INSERT/UPDATE: Profile owner only
        EXECUTE 'CREATE POLICY "social_channels_insert" ON public.social_channels FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
        EXECUTE 'CREATE POLICY "social_channels_update" ON public.social_channels FOR UPDATE TO authenticated USING (auth.uid() = user_id)';
        EXECUTE 'CREATE POLICY "social_channels_delete" ON public.social_channels FOR DELETE TO authenticated USING (auth.uid() = user_id)';
        
        EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_channels TO authenticated';
    END IF;
END $$;

-- ==========================================
-- FINAL: Force PostgREST to reload schema
-- ==========================================
NOTIFY pgrst, 'reload schema';

SELECT 'Grand Unification RLS Complete - All 14+ tables optimized' as status;

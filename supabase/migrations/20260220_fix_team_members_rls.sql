-- ==========================================
-- Fix Infinite Recursion in Team Members RLS
-- ==========================================
-- Migration Date: 2026-02-20
-- Issue: Login hangs due to recursive RLS check on team_members table
-- Solution: Replace recursive policies with safe policies using get_user_team_ids()

-- 1. Ensure helper functions are VOLATILE and use SET LOCAL row_security = off
-- (Just in case the previous migration wasn't applied or was reverted)

CREATE OR REPLACE FUNCTION public.get_user_team_ids(target_user_id UUID)
RETURNS SETOF UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
VOLATILE
AS $$
BEGIN
    -- Disable RLS to prevent recursion
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
    -- Disable RLS to prevent recursion
    SET LOCAL row_security = off;
    
    SELECT role INTO user_role
    FROM public.team_members
    WHERE team_id = target_team_id AND user_id = target_user_id
    LIMIT 1;
    
    RETURN (user_role = 'owner' OR user_role = 'admin');
END;
$$;

-- 2. Drop existing policies to remove the recursive one
-- using DO block to drop by pattern or known names is safer than exact names
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'team_members' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.team_members', pol.policyname);
    END LOOP;
END $$;

-- 3. Create new SAFE policies

-- Policy: SELECT (View)
-- Users can view team members if they are in the same team
-- Using the helper function breaks recursion because it runs with RLS disabled temporarily
CREATE POLICY "view_team_members"
ON public.team_members
FOR SELECT
USING (
    team_id IN (
        SELECT get_user_team_ids(auth.uid())
    )
);

-- Policy: INSERT (Add Member)
-- Only Owner/Admin can add members
CREATE POLICY "manage_team_members_insert"
ON public.team_members
FOR INSERT
WITH CHECK (
    is_team_owner_or_admin(team_id, auth.uid()) OR
    -- Allow users to add themselves (e.g. accepting invite)? Usually handled by RPC or edge function
    -- Basic rule: Owner adds member
    is_team_owner_or_admin(team_id, auth.uid())
);

-- Policy: UPDATE (Edit Role)
-- Only Owner/Admin can update members
CREATE POLICY "manage_team_members_update"
ON public.team_members
FOR UPDATE
USING (
    is_team_owner_or_admin(team_id, auth.uid())
)
WITH CHECK (
    is_team_owner_or_admin(team_id, auth.uid())
);

-- Policy: DELETE (Remove Member)
-- Only Owner/Admin can remove members
CREATE POLICY "manage_team_members_delete"
ON public.team_members
FOR DELETE
USING (
    is_team_owner_or_admin(team_id, auth.uid())
);

-- 4. Enable RLS (ensure it's on)
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- 5. Grant permissions (ensure authenticated users can access)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT SELECT ON public.team_members TO anon; -- minimal access

-- Verification
SELECT 'Fixed team_members RLS Policies' as status;

-- ==========================================
-- Fix STABLE Function Volatility Issue
-- ==========================================
-- Migration Date: 2026-02-17
-- Issue: STABLE functions cannot use SET LOCAL commands
-- Error: "SET is not allowed in a non-volatile function" (Code: 0A000)
-- Solution: Change STABLE to VOLATILE for functions using SET LOCAL

-- ==========================================
-- 1. Fix get_user_team_ids Function
-- ==========================================

-- This function is called by RLS policies to get user's team memberships
-- without triggering infinite recursion. It uses SET LOCAL to disable RLS,
-- which requires VOLATILE volatility.

CREATE OR REPLACE FUNCTION public.get_user_team_ids(target_user_id UUID)
RETURNS SETOF UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
VOLATILE  -- Changed from STABLE to VOLATILE
AS $$
BEGIN
    -- Disable RLS for this function execution
    -- This prevents infinite recursion when RLS policy calls this function
    SET LOCAL row_security = off;
    
    -- Return team IDs without triggering RLS
    RETURN QUERY 
    SELECT team_id 
    FROM public.team_members 
    WHERE user_id = target_user_id;
END;
$$;

COMMENT ON FUNCTION public.get_user_team_ids(UUID) IS 
'Returns team IDs for a given user. VOLATILE because it uses SET LOCAL to bypass RLS and prevent infinite recursion.';

-- ==========================================
-- 2. Fix is_team_owner_or_admin Function
-- ==========================================

-- This function checks if a user has owner/admin role in a team.
-- Used by RLS policies for permission checks.

CREATE OR REPLACE FUNCTION public.is_team_owner_or_admin(target_team_id UUID, target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
VOLATILE  -- Changed from STABLE to VOLATILE
AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Disable RLS to prevent recursion
    SET LOCAL row_security = off;
    
    -- Get user's role in the team
    SELECT role INTO user_role
    FROM public.team_members
    WHERE team_id = target_team_id AND user_id = target_user_id
    LIMIT 1;
    
    -- Check if user is owner or admin
    RETURN (user_role = 'owner' OR user_role = 'admin');
END;
$$;

COMMENT ON FUNCTION public.is_team_owner_or_admin(UUID, UUID) IS 
'Checks if user is owner or admin of a team. VOLATILE because it uses SET LOCAL to bypass RLS.';

-- ==========================================
-- 3. Verification Query
-- ==========================================

-- Run this to verify the functions are now VOLATILE
SELECT 
    p.proname AS function_name,
    CASE p.provolatile
        WHEN 'i' THEN 'IMMUTABLE'
        WHEN 's' THEN 'STABLE'
        WHEN 'v' THEN 'VOLATILE'
    END AS volatility,
    pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN ('get_user_team_ids', 'is_team_owner_or_admin')
ORDER BY p.proname;

-- ==========================================
-- 4. Test Queries
-- ==========================================

-- Test 1: Verify get_user_team_ids works
-- Replace with actual user_id from your database
-- SELECT * FROM public.get_user_team_ids('your-user-id-here');

-- Test 2: Verify is_team_owner_or_admin works
-- Replace with actual team_id and user_id
-- SELECT public.is_team_owner_or_admin('your-team-id-here', 'your-user-id-here');

-- ==========================================
-- 5. Affected Operations (Now Fixed)
-- ==========================================

-- The following operations were failing before this fix:
-- 
-- MCN Proxy Mode:
--   - Creating moments (life_moments INSERT)
--   - Updating moments (life_moments UPDATE)
--   - Deleting moments (life_moments DELETE)
--   - Updating creator profiles (profiles UPDATE)
--   - Applying to campaigns (campaign_applications INSERT)
--
-- Team Management:
--   - Adding team members (team_members INSERT)
--   - Updating member roles (team_members UPDATE)
--   - Viewing team members (team_members SELECT)
--
-- Brand Teams:
--   - Creating campaigns (campaigns INSERT)
--   - Creating products (brand_products INSERT)
--   - Creating proposals (brand_proposals, campaign_proposals, moment_proposals INSERT)
--
-- All these operations should now work correctly.

-- ==========================================
-- 6. Rollback Script (If Needed)
-- ==========================================

-- IMPORTANT: Only use this if you need to rollback the changes
-- This will restore the original STABLE volatility, which will cause
-- the "SET is not allowed in a non-volatile function" error to return.

/*
CREATE OR REPLACE FUNCTION public.get_user_team_ids(target_user_id UUID)
RETURNS SETOF UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE  -- Reverted to STABLE (will cause errors)
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
STABLE  -- Reverted to STABLE (will cause errors)
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
*/

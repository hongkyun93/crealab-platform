-- =============================================
-- FIX: Team Join Infinite Recursion
-- =============================================
-- Problem: get_user_team_ids() function causes infinite recursion
--          because it SELECTs from team_members, which has RLS policy
--          that calls get_user_team_ids() again.
--
-- Solution: Disable RLS within the function using plpgsql
--           with SET LOCAL row_security = off
-- =============================================

-- Drop existing function
DROP FUNCTION IF EXISTS public.get_user_team_ids(UUID);

-- Recreate with RLS bypass
CREATE OR REPLACE FUNCTION public.get_user_team_ids(target_user_id UUID)
RETURNS SETOF UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
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
'Returns team IDs for a user. Uses SECURITY DEFINER with RLS disabled to prevent infinite recursion when called from RLS policies.';

-- Also fix is_team_owner_or_admin to ensure it doesn't have recursion issues
DROP FUNCTION IF EXISTS public.is_team_owner_or_admin(UUID, UUID);

CREATE OR REPLACE FUNCTION public.is_team_owner_or_admin(target_team_id UUID, target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
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
'Checks if user is owner or admin of a team. Uses SECURITY DEFINER with RLS disabled to prevent recursion.';

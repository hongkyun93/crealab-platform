-- Comprehensive Fix for RLS Infinite Recursion
-- Problem: 'teams' policy queries 'team_members', and 'team_members' policy queries 'teams' (or itself).
-- Solution: Use a SECURITY DEFINER function to handle the "membership check" for both.

-- 1. Create a Helper Function (SECURITY DEFINER)
-- Bypasses RLS to get the list of teams the current user belongs to.
CREATE OR REPLACE FUNCTION public.get_my_team_ids()
RETURNS TABLE(team_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT tm.team_id 
    FROM public.team_members tm
    WHERE tm.user_id = auth.uid();
END;
$$;

-- 2. Fix 'teams' Table Policies
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own teams" ON public.teams;

-- New Policy: Use the function instead of direct table access
CREATE POLICY "Users can view their own teams" ON public.teams
    FOR SELECT 
    TO authenticated 
    USING (
        created_by = auth.uid() 
        OR 
        id IN (SELECT * FROM public.get_my_team_ids())
    );

-- 3. Fix 'team_members' Table Policies
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View members of own team" ON public.team_members;

-- New Policy: Use the function instead of direct table access
CREATE POLICY "View members of own team" ON public.team_members
    FOR SELECT
    TO authenticated
    USING (
        team_id IN (SELECT * FROM public.get_my_team_ids())
        OR
        -- Also allow if you are the creator of the team for the TeamContext logic 
        EXISTS (
            SELECT 1 FROM public.teams t
            WHERE t.id = public.team_members.team_id
            AND t.created_by = auth.uid()
        )
    );

-- 4. Ensure INSERT policy on team_members doesn't trigger recursion via 'teams' check
-- The previous INSERT policy I wrote:
-- EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND created_by = auth.uid())
-- This is fine because we just fixed the 'teams' SELECT policy to be non-recursive.


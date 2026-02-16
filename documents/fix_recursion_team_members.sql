-- Fix Infinite Recursion in team_members policy

-- 1. Ensure the helper function exists (from Master Schema)
CREATE OR REPLACE FUNCTION public.get_user_team_ids(target_user_id UUID)
RETURNS TABLE(team_id UUID)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT team_id FROM public.team_members WHERE user_id = target_user_id;
$$;

-- 2. Drop the problematic recursive policy
DROP POLICY IF EXISTS "View members of own team" ON public.team_members;

-- 3. Re-create using the SECURITY DEFINER function to break recursion
CREATE POLICY "View members of own team" ON public.team_members
    FOR SELECT
    TO authenticated
    USING (
        team_id IN ( SELECT team_id FROM public.get_user_team_ids(auth.uid()) )
        OR
        -- Also allow if you are the creator of the team (for the initial insert context)
        EXISTS (
            SELECT 1 FROM public.teams t
            WHERE t.id = public.team_members.team_id
            AND t.created_by = auth.uid()
        )
    );

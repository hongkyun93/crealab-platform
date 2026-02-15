-- Fix Infinite Recursion in team_members INSERT Policy
-- Issue: The policy references team_members table while RLS is enabled, causing recursion
-- Solution: Create a SECURITY DEFINER helper function to bypass RLS

-- Create helper function to check if user is owner/admin of a team
CREATE OR REPLACE FUNCTION public.is_team_owner_or_admin(target_team_id UUID, target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.team_members 
    WHERE team_id = target_team_id 
    AND user_id = target_user_id 
    AND role IN ('owner', 'admin')
  );
$$;

-- Recreate the INSERT policy using the helper function
DROP POLICY IF EXISTS "Owners and admins can add members" ON public.team_members;
CREATE POLICY "Owners and admins can add members" ON public.team_members
  FOR INSERT WITH CHECK (
    public.is_team_owner_or_admin(team_id, auth.uid())
  );

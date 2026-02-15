
-- Add created_by column to teams to fix RLS Visibility Race Condition
-- Issue: When creating a team, the 'members' trigger runs AFTER the insert.
-- The RLS Policy for 'SELECT' (used by RETURNING) runs before the trigger allows membership visibility.
-- Solution: Allow users to view teams they *created* explicitly via a column.

-- 1. Add Column
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users DEFAULT auth.uid();

-- 2. Update SELECT Policy
DROP POLICY IF EXISTS "Members can view their teams" ON public.teams;
CREATE POLICY "Members can view their teams" ON public.teams
  FOR SELECT USING (
    id IN (SELECT public.get_user_team_ids(auth.uid()))
    OR
    created_by = auth.uid()
  );

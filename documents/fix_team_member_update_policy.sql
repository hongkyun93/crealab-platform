-- Add missing UPDATE policy for team_members table
-- This allows owners/managers/admins to update team member roles

DROP POLICY IF EXISTS "Managers can update team members" ON public.team_members;
CREATE POLICY "Managers can update team members" ON public.team_members
  FOR UPDATE USING (
    -- Only owners/managers/admins can update
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'manager', 'admin')
    )
    OR
    -- Team creators can also update
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_members.team_id
      AND t.created_by = auth.uid()
    )
  );

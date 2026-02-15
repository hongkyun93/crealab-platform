-- Enable DELETE for team owners and admins
-- Uses the existing helper function public.is_team_owner_or_admin(team_id, user_id)

DROP POLICY IF EXISTS "Owners and admins can remove members" ON public.team_members;

CREATE POLICY "Owners and admins can remove members" ON public.team_members
FOR DELETE
USING (
  public.is_team_owner_or_admin(team_id, auth.uid()) 
);

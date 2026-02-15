
-- Fix get_user_team_ids volatility
-- STABLE functions do not see changes made by the current statement (e.g., INSERT trigger).
-- Changing to VOLATILE ensures it sees the row added by the trigger during INSERT ... RETURNING.

CREATE OR REPLACE FUNCTION public.get_user_team_ids(target_user_id UUID)
RETURNS TABLE(team_id UUID)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
VOLATILE -- Changed from STABLE
AS $$
  SELECT team_id FROM public.team_members WHERE user_id = target_user_id;
$$;

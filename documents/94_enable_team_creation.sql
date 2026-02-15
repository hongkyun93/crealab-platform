
-- Enable Team Creation for Authenticated Users
-- currently missing INSERT policy and auto-member trigger for manual team creation.

-- 1. Add INSERT Policy for Teams
DROP POLICY IF EXISTS "Authenticated users can create teams" ON public.teams;
CREATE POLICY "Authenticated users can create teams" ON public.teams 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- 2. Create Trigger Function to auto-add creator as owner
CREATE OR REPLACE FUNCTION public.handle_new_team()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Only add member if auth.uid() is present (manual creation)
  -- If created by system (handle_new_user), logic is handled there or auth.uid() might be the user anyway.
  -- But handle_new_user runs as postgres/admin usually or has its own logic.
  -- To avoid conflict: insert into team_members ON CONFLICT DO NOTHING?
  -- Or check if member exists?
  
  IF auth.uid() IS NOT NULL THEN
      INSERT INTO public.team_members (team_id, user_id, role)
      VALUES (new.id, auth.uid(), 'owner')
      ON CONFLICT (team_id, user_id) DO NOTHING;
  END IF;
  
  RETURN new;
END;
$$;

-- 3. Create Trigger
DROP TRIGGER IF EXISTS on_team_created ON public.teams;
CREATE TRIGGER on_team_created
  AFTER INSERT ON public.teams
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_team();

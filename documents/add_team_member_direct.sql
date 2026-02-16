-- Direct team member addition (bypasses invitation system entirely)
-- Replace values below:
--   - YOUR_TEAM_ID: Your MCN team's UUID (from teams table)
--   - MEMBER_EMAIL: The email of the person to add
--   - ROLE: 'owner', 'manager', 'admin', or 'member'

DO $$
DECLARE
    target_team_id UUID := 'YOUR_TEAM_ID'; -- Replace this
    member_email TEXT := 'employee1@creadypick.com'; -- Replace this
    member_role TEXT := 'manager'; -- Replace this
    user_id UUID;
BEGIN
    -- Get user ID from email
    SELECT id INTO user_id FROM auth.users WHERE email = member_email;
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', member_email;
    END IF;
    
    -- Remove from any existing teams (single team membership)
    DELETE FROM public.team_members WHERE user_id = user_id;
    
    -- Add to new team
    INSERT INTO public.team_members (team_id, user_id, role)
    VALUES (target_team_id, user_id, member_role)
    ON CONFLICT (team_id, user_id) DO UPDATE 
    SET role = EXCLUDED.role;
    
    RAISE NOTICE 'Successfully added % to team as %', member_email, member_role;
END $$;

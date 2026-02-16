-- Enable RLS on teams table (just in case)
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- 1. Allow authenticated users to CREATE a team
-- This is necessary for the onboarding flow
DROP POLICY IF EXISTS "Authenticated users can create teams" ON public.teams;
CREATE POLICY "Authenticated users can create teams" ON public.teams
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true); -- Or check auth.uid() = created_by if column exists and is populated

-- 2. Allow users to VIEW teams they are members of OR created
-- Also useful to allow viewing all teams if we want a directory, but let's restrict for now
DROP POLICY IF EXISTS "Users can view their own teams" ON public.teams;
CREATE POLICY "Users can view their own teams" ON public.teams
    FOR SELECT 
    TO authenticated 
    USING (
        auth.uid() = created_by 
        OR 
        EXISTS (
            SELECT 1 FROM public.team_members 
            WHERE team_id = public.teams.id 
            AND user_id = auth.uid()
        )
    );

-- 3. Allow owners to UPDATE their teams
DROP POLICY IF EXISTS "Owners can update their teams" ON public.teams;
CREATE POLICY "Owners can update their teams" ON public.teams
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members 
            WHERE team_id = public.teams.id 
            AND user_id = auth.uid()
            AND role = 'owner'
        )
    );

-- Also ensure team_members allows INSERT for self if you are the owner (which handleCreateTeam does)
-- But handleCreateTeam does: insert team -> then insert team_member.
-- The insert team_member might fail if RLS on team_members doesn't allow it.

-- Let's check team_members policies.
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Allow inserting SELF as OWNER for a NEW TEAM
-- This is tricky because the team just got created. 
-- The user is not yet a member.
-- But the user IS the creator of the team.
DROP POLICY IF EXISTS "Creators can add themselves as owner" ON public.team_members;
CREATE POLICY "Creators can add themselves as owner" ON public.team_members
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid() 
        AND role = 'owner'
        AND EXISTS (
             SELECT 1 FROM public.teams
             WHERE id = team_id
             AND created_by = auth.uid()
        )
    );

-- Allow VIEWing members of own team
DROP POLICY IF EXISTS "View members of own team" ON public.team_members;
CREATE POLICY "View members of own team" ON public.team_members
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = public.team_members.team_id
            AND tm.user_id = auth.uid()
        )
        -- Also allow if you are the creator of the team (for the initial insert return)
        OR
        EXISTS (
            SELECT 1 FROM public.teams t
            WHERE t.id = public.team_members.team_id
            AND t.created_by = auth.uid()
        )
    );

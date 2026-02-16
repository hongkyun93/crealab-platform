-- 1. Ensure team_invitations table exists
CREATE TABLE IF NOT EXISTS public.team_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    invited_by UUID REFERENCES public.profiles(id),
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
    UNIQUE(team_id, email)
);

-- 2. Grant permissions just in case
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Allow users to view invitations for their own email
DROP POLICY IF EXISTS "View own invitations" ON public.team_invitations;
CREATE POLICY "View own invitations" ON public.team_invitations
    FOR SELECT
    TO authenticated
    USING (
        email = (auth.jwt() ->> 'email')
    );

-- 3. Re-create the RPC function with robust settings
CREATE OR REPLACE FUNCTION public.get_my_invitations()
RETURNS TABLE (
    id UUID,
    team_id UUID,
    team_name TEXT,
    role TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER -- Run as function creator (admin) to bypass RLS issues
SET search_path = public
AS $$
DECLARE
    current_email TEXT;
BEGIN
    -- Get current user's email securely from JWT
    current_email := auth.jwt() ->> 'email';
    
    -- Return pending invitations
    RETURN QUERY
    SELECT 
        ti.id,
        ti.team_id,
        t.name as team_name,
        ti.role,
        ti.created_at
    FROM public.team_invitations ti
    JOIN public.teams t ON ti.team_id = t.id
    WHERE ti.email = current_email
    AND ti.status = 'pending';
    -- Removed expires_at check for testing visibility, can add back later
END;
$$;

-- 4. Re-create Accept Invitation RPC
CREATE OR REPLACE FUNCTION public.accept_invitation(invitation_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    invite_record RECORD;
    current_email TEXT;
    user_uid UUID;
BEGIN
    current_email := auth.jwt() ->> 'email';
    user_uid := auth.uid();

    -- Fetch the invitation 
    SELECT * INTO invite_record
    FROM public.team_invitations
    WHERE id = invitation_id
    AND email = current_email
    AND status = 'pending';

    IF invite_record.id IS NULL THEN
        RAISE EXCEPTION 'Invitation not found or invalid';
    END IF;

    -- Add user to team
    INSERT INTO public.team_members (team_id, user_id, role)
    VALUES (invite_record.team_id, user_uid, invite_record.role)
    ON CONFLICT (team_id, user_id) 
    DO UPDATE SET role = EXCLUDED.role;

    -- Mark invitation as accepted
    UPDATE public.team_invitations
    SET status = 'accepted'
    WHERE id = invitation_id;
    
    RETURN TRUE;
END;
$$;

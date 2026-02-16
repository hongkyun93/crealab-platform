-- ==========================================
-- Invitation Handling Logic for Onboarding
-- ==========================================

-- 1. Function to get invitations for the current user (based on Email)
CREATE OR REPLACE FUNCTION public.get_my_invitations()
RETURNS TABLE (
    id UUID,
    team_id UUID,
    team_name TEXT,
    role TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_email TEXT;
BEGIN
    -- Get current user's email from auth.jwt()
    current_email := auth.jwt() ->> 'email';
    
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
    AND ti.status = 'pending'
    AND ti.expires_at > now();
END;
$$;

-- 2. Function to Accept Invitation
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

    -- Fetch the invitation securely
    SELECT * INTO invite_record
    FROM public.team_invitations
    WHERE id = invitation_id
    AND email = current_email
    AND status = 'pending'
    AND expires_at > now();

    IF invite_record.id IS NULL THEN
        RAISE EXCEPTION 'Invalid or expired invitation';
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

-- 3. Policy to view OWN email invitations (Alternative to RPC, but RPC is safer/easier here)
-- (Skipping Policy change to avoid complex conflicts, RPC is sufficient for onboarding)

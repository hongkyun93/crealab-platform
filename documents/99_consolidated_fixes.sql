-- ==========================================
-- CONSOLIDATED FIXES SCRIPT
-- Run this to apply all recent fixes for MCN Onboarding & Permissions
-- ==========================================

-- 1. TEAM CREATION PERMISSIONS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can create teams" ON public.teams;
CREATE POLICY "Authenticated users can create teams" ON public.teams
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

-- 2. RECURSION FIXES (Helper Function + Policies)
CREATE OR REPLACE FUNCTION public.get_my_team_ids()
RETURNS TABLE(team_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT tm.team_id 
    FROM public.team_members tm
    WHERE tm.user_id = auth.uid();
END;
$$;

-- Fix 'teams' SELECT Policy
DROP POLICY IF EXISTS "Users can view their own teams" ON public.teams;
CREATE POLICY "Users can view their own teams" ON public.teams
    FOR SELECT 
    TO authenticated 
    USING (
        created_by = auth.uid() 
        OR 
        id IN (SELECT * FROM public.get_my_team_ids())
    );

-- Fix 'team_members' SELECT Policy
DROP POLICY IF EXISTS "View members of own team" ON public.team_members;
CREATE POLICY "View members of own team" ON public.team_members
    FOR SELECT
    TO authenticated
    USING (
        team_id IN (SELECT * FROM public.get_my_team_ids())
        OR
        EXISTS (
            SELECT 1 FROM public.teams t
            WHERE t.id = public.team_members.team_id
            AND t.created_by = auth.uid()
        )
    );

-- 3. INVITATION LOGIC RPCs
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

ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Allow users to view invitations for their own email
DROP POLICY IF EXISTS "View own invitations" ON public.team_invitations;
CREATE POLICY "View own invitations" ON public.team_invitations
    FOR SELECT
    TO authenticated
    USING (
        email = (auth.jwt() ->> 'email')
    );

-- Allow team owners/managers to view invitations for their team
DROP POLICY IF EXISTS "Team members view invitations" ON public.team_invitations;
CREATE POLICY "Team members view invitations" ON public.team_invitations
    FOR SELECT
    TO authenticated
    USING (
        team_id IN (SELECT * FROM public.get_my_team_ids())
    );

-- Allow team owners/managers to create invitations
DROP POLICY IF EXISTS "Managers create invitations" ON public.team_invitations;
CREATE POLICY "Managers create invitations" ON public.team_invitations
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.team_members
            WHERE team_id = team_invitations.team_id
            AND user_id = auth.uid()
            AND role IN ('owner', 'manager', 'admin')
        )
    );

-- Allow team owners/managers to delete invitations
DROP POLICY IF EXISTS "Managers delete invitations" ON public.team_invitations;
CREATE POLICY "Managers delete invitations" ON public.team_invitations
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members
            WHERE team_id = team_invitations.team_id
            AND user_id = auth.uid()
            AND role IN ('owner', 'manager', 'admin')
        )
    );

-- RPC: Get My Invitations
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
    AND ti.status = 'pending';
END;
$$;

-- RPC: Accept Invitation
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

    SELECT * INTO invite_record
    FROM public.team_invitations
    WHERE id = invitation_id
    AND email = current_email
    AND status = 'pending';

    IF invite_record.id IS NULL THEN
        RAISE EXCEPTION 'Invitation not found or invalid';
    END IF;

    INSERT INTO public.team_members (team_id, user_id, role)
    VALUES (invite_record.team_id, user_uid, invite_record.role)
    ON CONFLICT (team_id, user_id) 
    DO UPDATE SET role = EXCLUDED.role;

    UPDATE public.team_invitations
    SET status = 'accepted'
    WHERE id = invitation_id;
    
    RETURN TRUE;
END;
$$;

-- 4. INVITATION LINK SUPPORT (New)
-- Add invite_code column if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_invitations' AND column_name = 'invite_code') THEN
        ALTER TABLE public.team_invitations ADD COLUMN invite_code text DEFAULT substring(md5(random()::text) from 0 for 12);
        CREATE INDEX idx_team_invitaions_code ON public.team_invitations(invite_code);
    END IF;
END $$;

-- RPC: Get Invitation Info (Public Access)
CREATE OR REPLACE FUNCTION public.get_invitation_by_code(code text)
RETURNS TABLE (
    valid boolean,
    team_id uuid,
    team_name text,
    inviter_name text,
    inviter_avatar text,
    error_message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    invite_record RECORD;
    team_record RECORD;
    inviter_record RECORD;
BEGIN
    -- 1. Find invitation
    SELECT * INTO invite_record FROM public.team_invitations WHERE invite_code = code AND status = 'pending';
    
    IF invite_record.id IS NULL THEN
        RETURN QUERY SELECT false, null::uuid, null::text, null::text, null::text, '유효하지 않은 초대 코드입니다.'::text;
        RETURN;
    END IF;

    -- 2. Check expiration
    IF invite_record.expires_at < now() THEN
        RETURN QUERY SELECT false, null::uuid, null::text, null::text, null::text, '만료된 초대 코드입니다.'::text;
        RETURN;
    END IF;

    -- 3. Get Team Info
    SELECT * INTO team_record FROM public.teams WHERE id = invite_record.team_id;

    -- 4. Get Inviter Info
    SELECT * INTO inviter_record FROM public.profiles WHERE id = invite_record.invited_by;

    RETURN QUERY SELECT 
        true, 
        team_record.id, 
        team_record.name, 
        COALESCE(inviter_record.display_name, inviter_record.email), 
        inviter_record.avatar_url,
        null::text;
END;
$$;

-- RPC: Join Team with Code
CREATE OR REPLACE FUNCTION public.join_team_with_code(code text)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    invite_record RECORD;
    current_user_id UUID;
    is_member BOOLEAN;
BEGIN
    current_user_id := auth.uid();
    IF current_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', '로그인이 필요합니다.');
    END IF;

    -- 1. Find invitation
    SELECT * INTO invite_record FROM public.team_invitations WHERE invite_code = code AND status = 'pending';
    
    IF invite_record.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', '유효하지 않거나 만료된 초대입니다.');
    END IF;

    -- 2. Check if already member of THIS team
    SELECT EXISTS (SELECT 1 FROM public.team_members WHERE team_id = invite_record.team_id AND user_id = current_user_id) INTO is_member;
    
    IF is_member THEN
        -- If already in this team, just return success
        RETURN jsonb_build_object('success', true, 'message', 'Already a member');
    END IF;

    -- 3. Leave ANY other teams (Enforce single team membership for this flow)
    -- User requested: "Leave original team and join new one"
    DELETE FROM public.team_members WHERE user_id = current_user_id;

    -- 4. Add to new team
    INSERT INTO public.team_members (team_id, user_id, role)
    VALUES (invite_record.team_id, current_user_id, invite_record.role);

    -- 5. Update Invitation Status
    UPDATE public.team_invitations 
    SET status = 'accepted' 
    WHERE id = invite_record.id;

    RETURN jsonb_build_object('success', true, 'team_id', invite_record.team_id);
END;
$$;

-- RPC: Invite Team Member (Secure & Robust)
-- Replaces client-side INSERT to avoid RLS recursion/permission issues
CREATE OR REPLACE FUNCTION public.invite_team_member(
    target_team_id UUID,
    target_email TEXT,
    target_role TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id UUID;
    is_authorized BOOLEAN;
    existing_member_id UUID;
    existing_invite_id UUID;
BEGIN
    current_user_id := auth.uid();
    
    -- 1. Check Permissions (Must be owner/manager/admin OR Team Creator)
    SELECT EXISTS (
        SELECT 1 FROM public.team_members 
        WHERE team_id = target_team_id 
        AND user_id = current_user_id 
        AND role IN ('owner', 'manager', 'admin')
    ) OR EXISTS (
        SELECT 1 FROM public.teams
        WHERE id = target_team_id
        AND created_by = current_user_id
    ) INTO is_authorized;

    IF NOT is_authorized THEN
        RETURN jsonb_build_object('success', false, 'message', '초대 권한이 없습니다.');
    END IF;

    -- 2. Check if already a member
    -- We need to find the user_id for this email to check team_members.
    -- However, user might not exist yet. If they do:
    SELECT id INTO existing_member_id FROM public.profiles WHERE email = target_email;
    
    IF existing_member_id IS NOT NULL THEN
        IF EXISTS (SELECT 1 FROM public.team_members WHERE team_id = target_team_id AND user_id = existing_member_id) THEN
            RETURN jsonb_build_object('success', false, 'message', '이미 팀 멤버입니다.');
        END IF;
    END IF;

    -- 3. Check if already invited (pending)
    SELECT id INTO existing_invite_id FROM public.team_invitations 
    WHERE team_id = target_team_id AND email = target_email AND status = 'pending';

    IF existing_invite_id IS NOT NULL THEN
        RETURN jsonb_build_object('success', false, 'message', '이미 대기 중인 초대가 있습니다.');
    END IF;

    -- 4. Create Invitation
    INSERT INTO public.team_invitations (team_id, email, role, invited_by, status)
    VALUES (target_team_id, target_email, target_role, current_user_id, 'pending');

    RETURN jsonb_build_object('success', true, 'message', '초대가 발송되었습니다.');
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'message', '오류 발생: ' || SQLERRM);
END;
$$;

-- RPC: Get My Invitations
-- Used in onboarding to show pending invites
DROP FUNCTION IF EXISTS public.get_my_invitations();
CREATE OR REPLACE FUNCTION public.get_my_invitations()
RETURNS TABLE (
    id UUID,
    team_id UUID,
    team_name TEXT,
    role TEXT,
    created_at TIMESTAMPTZ,
    inviter_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_email TEXT;
BEGIN
    current_email := auth.jwt() ->> 'email';
    
    RETURN QUERY
    SELECT 
        ti.id,
        ti.team_id,
        t.name as team_name,
        ti.role,
        ti.created_at,
        p.display_name as inviter_name
    FROM public.team_invitations ti
    JOIN public.teams t ON ti.team_id = t.id
    LEFT JOIN public.profiles p ON ti.invited_by = p.id
    WHERE ti.email = current_email
    AND ti.status = 'pending'
    AND ti.expires_at > now();
END;
$$;

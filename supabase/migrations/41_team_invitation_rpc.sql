-- Migration: Team Invitation RPC Functions
-- Purpose: Allow users (including logged-out) to validate invite codes,
--          and authenticated users to join a team via invite code.

-- ─────────────────────────────────────────────────────────────────────────
-- 1. get_invitation_by_code(code text)
--    Returns invitation info without requiring team membership (SECURITY DEFINER)
--    Called by /join/[code] page for both logged-in and logged-out users.
-- ─────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_invitation_by_code(code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    inv RECORD;
    team_rec RECORD;
    inviter_rec RECORD;
BEGIN
    -- Fetch invitation by invite_code
    SELECT *
    INTO inv
    FROM public.team_invitations
    WHERE invite_code = code
    LIMIT 1;

    -- Not found
    IF inv.id IS NULL THEN
        RETURN jsonb_build_object(
            'valid', false,
            'error_message', '유효하지 않은 초대 코드입니다.'
        );
    END IF;

    -- Expired
    IF inv.expires_at IS NOT NULL AND inv.expires_at < now() THEN
        RETURN jsonb_build_object(
            'valid', false,
            'error_message', '만료된 초대 링크입니다.'
        );
    END IF;

    -- Already used (accepted/cancelled)
    IF inv.status NOT IN ('pending', 'active') THEN
        RETURN jsonb_build_object(
            'valid', false,
            'error_message', '이미 사용되었거나 취소된 초대 링크입니다.'
        );
    END IF;

    -- Fetch team info
    SELECT id, slug, logo_url, name
    INTO team_rec
    FROM public.teams
    WHERE id = inv.team_id
    LIMIT 1;

    -- Fetch inviter profile
    SELECT display_name, avatar_url
    INTO inviter_rec
    FROM public.profiles
    WHERE id = COALESCE(inv.invited_by, inv.created_by)
    LIMIT 1;

    RETURN jsonb_build_object(
        'valid',          true,
        'team_id',        team_rec.id,
        'team_name',      COALESCE(team_rec.name, team_rec.slug),
        'team_avatar',    team_rec.logo_url,
        'inviter_name',   inviter_rec.display_name,
        'inviter_avatar', inviter_rec.avatar_url,
        'role',           inv.role,
        'expires_at',     inv.expires_at
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'valid', false,
        'error_message', '초대 정보를 불러오는 중 오류가 발생했습니다: ' || SQLERRM
    );
END;
$$;

-- Anyone (including anon) can call this to validate a code
GRANT EXECUTE ON FUNCTION public.get_invitation_by_code(text) TO anon, authenticated;


-- ─────────────────────────────────────────────────────────────────────────
-- 2. join_team_with_code(code text)
--    Authenticated users join the team identified by the invite code.
--    - Enforces single team membership (removes from existing team first)
--    - Marks invitation as accepted
-- ─────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.join_team_with_code(code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    user_uid  UUID := auth.uid();
    inv       RECORD;
    team_rec  RECORD;
    is_member BOOLEAN;
BEGIN
    IF user_uid IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', '로그인이 필요합니다.');
    END IF;

    -- Fetch invitation
    SELECT *
    INTO inv
    FROM public.team_invitations
    WHERE invite_code = code
    LIMIT 1;

    IF inv.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', '유효하지 않은 초대 코드입니다.');
    END IF;

    IF inv.expires_at IS NOT NULL AND inv.expires_at < now() THEN
        RETURN jsonb_build_object('success', false, 'message', '만료된 초대 링크입니다.');
    END IF;

    IF inv.status NOT IN ('pending', 'active') THEN
        RETURN jsonb_build_object('success', false, 'message', '이미 사용되었거나 취소된 초대 링크입니다.');
    END IF;

    -- Check if already a member of THIS team
    SELECT EXISTS (
        SELECT 1 FROM public.team_members
        WHERE team_id = inv.team_id AND user_id = user_uid
    ) INTO is_member;

    IF is_member THEN
        RETURN jsonb_build_object('success', true, 'message', 'Already a member');
    END IF;

    -- Remove from any other teams (single team enforcement)
    DELETE FROM public.team_members WHERE user_id = user_uid;

    -- Add to new team
    INSERT INTO public.team_members (team_id, user_id, role)
    VALUES (inv.team_id, user_uid, COALESCE(inv.role, 'member'));

    -- Mark invitation as accepted
    UPDATE public.team_invitations
    SET status = 'accepted'
    WHERE id = inv.id;

    -- Fetch team name for response
    SELECT COALESCE(name, slug) INTO team_rec.name
    FROM public.teams
    WHERE id = inv.team_id;

    RETURN jsonb_build_object(
        'success',  true,
        'message',  '팀에 합류했습니다.',
        'team_id',  inv.team_id
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', '팀 합류 중 오류가 발생했습니다: ' || SQLERRM);
END;
$$;

-- Only authenticated users can join
GRANT EXECUTE ON FUNCTION public.join_team_with_code(text) TO authenticated;

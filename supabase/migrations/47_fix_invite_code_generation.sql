-- Migration 47: invite_team_member RPC에서 invite_code 생성 누락 버그 수정
-- 
-- [버그 원인]
-- invite_team_member RPC가 team_invitations에 INSERT할 때 invite_code를 생성하지 않아 NULL 저장.
-- /join/[code] 페이지는 invite_code 컬럼으로만 검색하므로 항상 "유효하지 않은 초대 코드" 오류 발생.
-- 링크 복사 시 invite_code가 NULL이어서 invitation.id(UUID)로 fallback 되지만,
-- get_invitation_by_code는 invite_code 컬럼으로만 조회하므로 매칭 실패.
--
-- [수정 내용]
-- INSERT 시 invite_code = gen_random_uuid()::text 자동 생성하도록 RPC 수정.
-- 또한 함수 반환값에 invite_code를 포함하여 프론트에서 즉시 링크 생성 가능하도록 개선.

CREATE OR REPLACE FUNCTION public.invite_team_member(target_team_id uuid, target_email text, target_role text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    current_user_id UUID;
    is_authorized   BOOLEAN;
    existing_member_id UUID;
    existing_invite_id UUID;
    new_invite_code TEXT;
BEGIN
    current_user_id := auth.uid();

    -- 1. 권한 확인 (owner / manager / admin 또는 팀 생성자)
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

    -- 2. 이미 멤버인지 확인
    SELECT id INTO existing_member_id FROM public.profiles WHERE email = target_email;

    IF existing_member_id IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM public.team_members
            WHERE team_id = target_team_id AND user_id = existing_member_id
        ) THEN
            RETURN jsonb_build_object('success', false, 'message', '이미 팀 멤버입니다.');
        END IF;
    END IF;

    -- 3. 이미 대기 중인 초대 확인 → 있으면 기존 invite_code 반환
    SELECT id, invite_code
    INTO existing_invite_id, new_invite_code
    FROM public.team_invitations
    WHERE team_id = target_team_id AND email = target_email AND status = 'pending'
    LIMIT 1;

    IF existing_invite_id IS NOT NULL THEN
        -- invite_code가 없으면 신규 생성 후 업데이트
        IF new_invite_code IS NULL THEN
            new_invite_code := gen_random_uuid()::text;
            UPDATE public.team_invitations
            SET invite_code = new_invite_code
            WHERE id = existing_invite_id;
        END IF;
        RETURN jsonb_build_object(
            'success', true,
            'message', '이미 대기 중인 초대가 있습니다. 기존 링크를 반환합니다.',
            'invite_code', new_invite_code
        );
    END IF;

    -- 4. 신규 초대 생성 (invite_code 자동 생성)
    new_invite_code := gen_random_uuid()::text;

    INSERT INTO public.team_invitations (team_id, email, role, invited_by, status, invite_code)
    VALUES (target_team_id, target_email, target_role, current_user_id, 'pending', new_invite_code);

    RETURN jsonb_build_object(
        'success', true,
        'message', '초대가 생성되었습니다.',
        'invite_code', new_invite_code
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', '오류 발생: ' || SQLERRM);
END;
$$;

-- Migration 48: 알림 기반 MCN 팀 초대 시스템
-- 링크/코드 방식을 폐기하고, MCN이 이메일로 검색 후 앱 내 알림으로 초대하는 방식으로 전환.
-- 크리에이터는 알림에서 "수락" 버튼 클릭으로 즉시 팀 합류.

-- ─────────────────────────────────────────────────────────────────
-- 1. search_creator_by_email: MCN이 이메일로 크리에이터 검색
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.search_creator_by_email(search_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
    caller_id UUID := auth.uid();
    profile_rec RECORD;
    team_rec RECORD;
BEGIN
    IF caller_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', '로그인이 필요합니다.');
    END IF;

    -- auth.users 테이블과 조인해서 이메일로 검색
    -- profiles.email이 NULL인 경우에도 auth.users.email로 fallback
    SELECT
        p.id, p.display_name, p.avatar_url,
        COALESCE(p.email, u.email) AS email,
        p.role, p.followers_count, p.tags
    INTO profile_rec
    FROM public.profiles p
    JOIN auth.users u ON u.id = p.id
    WHERE (
        LOWER(p.email) = LOWER(search_email)
        OR LOWER(u.email) = LOWER(search_email)
    )
    AND p.role NOT IN ('admin')
    LIMIT 1;

    IF profile_rec.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', '해당 이메일로 등록된 계정이 없습니다. 크레디픽에 가입된 이메일인지 확인해주세요.');
    END IF;

    -- 현재 소속 팀 확인
    SELECT t.id, COALESCE(t.name, t.slug) AS team_name
    INTO team_rec
    FROM public.team_members tm
    JOIN public.teams t ON t.id = tm.team_id
    WHERE tm.user_id = profile_rec.id
    LIMIT 1;

    RETURN jsonb_build_object(
        'success',         true,
        'user_id',         profile_rec.id,
        'display_name',    COALESCE(profile_rec.display_name, '이름 없음'),
        'avatar_url',      profile_rec.avatar_url,
        'email',           profile_rec.email,
        'role',            profile_rec.role,
        'followers_count', profile_rec.followers_count,
        'tags',            profile_rec.tags,
        'current_team_id',   COALESCE(team_rec.id::text, null),
        'current_team_name', team_rec.team_name
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_creator_by_email(text) TO authenticated;



-- ─────────────────────────────────────────────────────────────────
-- 2. send_team_invite_notification: MCN → 크리에이터 초대 알림 발송
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.send_team_invite_notification(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    caller_id  UUID := auth.uid();
    team_rec   RECORD;
    caller_rec RECORD;
    target_rec RECORD;
    existing_notif_id UUID;
BEGIN
    IF caller_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', '로그인이 필요합니다.');
    END IF;

    -- 호출자의 팀 확인 (owner / admin / manager 권한)
    SELECT t.id, COALESCE(t.name, t.slug) AS team_name
    INTO team_rec
    FROM public.team_members tm
    JOIN public.teams t ON t.id = tm.team_id
    WHERE tm.user_id = caller_id
      AND tm.role IN ('owner', 'admin', 'manager')
    LIMIT 1;

    IF team_rec.id IS NULL THEN
        -- 팀 생성자인지도 확인
        SELECT id, COALESCE(name, slug) AS team_name
        INTO team_rec
        FROM public.teams
        WHERE created_by = caller_id
        LIMIT 1;
    END IF;

    IF team_rec.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', '팀 관리 권한이 없습니다.');
    END IF;

    -- 대상 계정 확인 (브랜드/어드민 제외 모든 역할 초대 가능)
    SELECT id, display_name FROM public.profiles
    WHERE id = target_user_id
      AND role NOT IN ('admin')
    INTO target_rec;

    IF target_rec.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', '유효하지 않은 계정입니다.');
    END IF;

    -- 이미 팀 멤버인지 확인
    IF EXISTS (
        SELECT 1 FROM public.team_members
        WHERE team_id = team_rec.id AND user_id = target_user_id
    ) THEN
        RETURN jsonb_build_object('success', false, 'message', '이미 팀 멤버입니다.');
    END IF;

    -- 이미 대기 중인 초대가 있으면 삭제 후 재발송
    DELETE FROM public.notifications
    WHERE recipient_id = target_user_id
      AND type = 'team_invite'
      AND reference_id = team_rec.id
      AND is_read = false;

    -- 호출자 이름 조회
    SELECT display_name INTO caller_rec FROM public.profiles WHERE id = caller_id;

    -- 알림 INSERT (reference_id = team_id)
    INSERT INTO public.notifications (recipient_id, sender_id, type, content, reference_id, is_read)
    VALUES (
        target_user_id,
        caller_id,
        'team_invite',
        caller_rec.display_name || '님이 ' || team_rec.team_name || ' MCN 팀으로 초대했습니다. 수락하면 즉시 팀에 합류됩니다.',
        team_rec.id,
        false
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', target_rec.display_name || '님에게 초대 알림을 보냈습니다.'
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.send_team_invite_notification(uuid) TO authenticated;


-- ─────────────────────────────────────────────────────────────────
-- 3. accept_team_invite: 크리에이터가 알림에서 수락 버튼 클릭
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.accept_team_invite(notification_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    caller_id  UUID := auth.uid();
    notif_rec  RECORD;
    team_name  TEXT;
BEGIN
    IF caller_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', '로그인이 필요합니다.');
    END IF;

    -- 알림 조회 (본인 수신 + team_invite 타입)
    SELECT * INTO notif_rec
    FROM public.notifications
    WHERE id = notification_id
      AND recipient_id = caller_id
      AND type = 'team_invite';

    IF notif_rec.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', '유효하지 않은 초대입니다. (수신 아닙니다)');
    END IF;

    IF notif_rec.reference_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', '초대에 팀 정보가 없습니다.');
    END IF;

    -- 팀 이름 조회
    SELECT COALESCE(name, slug) INTO team_name
    FROM public.teams WHERE id = notif_rec.reference_id;

    IF team_name IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', '해당 팀이 존재하지 않습니다.');
    END IF;

    -- 기존 팀에서 탈퇴 (단일 팀 정책)
    DELETE FROM public.team_members WHERE user_id = caller_id;

    -- 새 팀에 합류
    INSERT INTO public.team_members (team_id, user_id, role)
    VALUES (notif_rec.reference_id, caller_id, 'creator');

    -- 알림 읽음 처리
    UPDATE public.notifications SET is_read = true WHERE id = notification_id;

    RETURN jsonb_build_object(
        'success',   true,
        'message',   team_name || ' 팀에 합류했습니다!',
        'team_id',   notif_rec.reference_id
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'message', '팀 합류 중 오류: ' || SQLERRM
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_team_invite(uuid) TO authenticated;

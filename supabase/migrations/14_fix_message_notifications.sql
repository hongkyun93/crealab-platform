-- 1. 채팅 메시지 알림 발송 함수 수정
-- 기존에 reference_id 로 NEW.id(메시지ID)를 넣었던 것을 NEW.workspace_id(워크스페이스ID)로 수정하여 워크스페이스 탭으로 올바르게 라우팅되게 합니다.
-- 또한 클라이언트에서 생성하던 디테일한 알림 텍스트 퀄리티와 동일하게 맞춰줍니다.

CREATE OR REPLACE FUNCTION public.notify_user_on_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    sender_name TEXT;
    v_project_title TEXT;
    project_prefix TEXT := '';
BEGIN
    -- 시스템 안내 메시지인 경우 알림을 생성하지 않음 (기존 프론트엔드 로직 동일 구현)
    IF NEW.content LIKE '[시스템%' OR NEW.content LIKE '📄 [시스템%' OR NEW.content LIKE '✅ [시스템%' OR NEW.is_mock = true THEN
        RETURN NEW;
    END IF;

    -- 발신자 이름 조회
    SELECT display_name INTO sender_name
    FROM profiles WHERE id = NEW.sender_id;
    
    -- 워크스페이스의 프로젝트 이름 조회 (알림 문구용)
    SELECT project_title INTO v_project_title
    FROM workspaces WHERE id = NEW.workspace_id;
    
    IF v_project_title IS NOT NULL THEN
        project_prefix := '[' || v_project_title || '] 워크스페이스' || E'\n';
    END IF;

    -- 알림 생성
    INSERT INTO notifications (recipient_id, sender_id, type, content, reference_id)
    VALUES (
        NEW.receiver_id,
        NEW.sender_id,
        'new_message',
        project_prefix || COALESCE(sender_name, '상대방') || '님: ' || LEFT(NEW.content, 30),
        NEW.workspace_id::text  -- 핵심 수정 부분: message_id 가 아닌 workspace_id 를 바인딩
    );
    
    RETURN NEW;
END;
$$;

-- 1. 채팅 메시지 알림 발송 함수 형변환 에러 수정
-- 기존에 reference_id 로 NEW.workspace_id::text 를 넣어서 타입 에러(uuid 컬럼에 text 삽입)가 발생했던 부분을 수정합니다.

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
    -- 시스템 안내 메시지인 경우 알림을 생성하지 않음
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
        NEW.workspace_id  -- ::text 제거, UUID 타입 그대로 삽입
    );
    
    RETURN NEW;
END;
$$;

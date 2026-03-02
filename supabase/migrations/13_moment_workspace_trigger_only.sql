-- 1. moment_proposals 전용 트리거 함수
CREATE OR REPLACE FUNCTION public.create_workspace_on_moment_accept()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_workspace_id uuid;
    v_project_title text;
BEGIN
    -- status가 'accepted'로 변경되었을 때만 작동
    IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
        -- 이미 워크스페이스가 있으면 건너뜀
        IF NEW.workspace_id IS NOT NULL THEN RETURN NEW; END IF;

        -- 모먼트 이름(project_title) 가져오기
        SELECT title INTO v_project_title
        FROM public.life_moments
        WHERE id = NEW.moment_id;

        -- 만약 모먼트 이름을 못 찾았다면 기본값 설정
        IF v_project_title IS NULL THEN
            v_project_title := '모먼트 제안 워크스페이스';
        END IF;

        -- 워크스페이스 레코드 생성 (project_title 반드시 포함!)
        INSERT INTO public.workspaces (
            brand_id, 
            creator_id, 
            project_title,
            original_proposal_id, 
            original_proposal_type, 
            status, 
            created_at
        )
        VALUES (
            NEW.brand_id, 
            NEW.creator_id, 
            v_project_title,
            NEW.id, 
            'moment', 
            'active', 
            NOW()
        )
        RETURNING id INTO v_workspace_id;

        -- 제안 목록에 워크스페이스 ID 저장 (순환 참조 방지용 BEFORE 트리거에 적합)
        NEW.workspace_id = v_workspace_id;

        -- 최초 시스템 메시지 생성
        INSERT INTO public.messages (
            workspace_id, 
            sender_id, 
            receiver_id, 
            content, 
            is_read, 
            is_mock
        )
        VALUES (
            v_workspace_id, 
            NEW.brand_id, 
            NEW.creator_id, 
            '📄 [시스템] 모먼트 제안이 수락되어 워크스페이스가 생성되었습니다.', 
            false, 
            true
        );
    END IF;
    RETURN NEW;
END;
$$;

-- 2. 기존 트리거 싹 지우고 새로 달기
DROP TRIGGER IF EXISTS trg_create_workspace_on_moment_accept ON public.moment_proposals;
CREATE TRIGGER trg_create_workspace_on_moment_accept
    BEFORE UPDATE OF status ON public.moment_proposals
    FOR EACH ROW EXECUTE FUNCTION public.create_workspace_on_moment_accept();

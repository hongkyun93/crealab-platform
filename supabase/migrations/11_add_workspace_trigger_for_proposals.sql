-- 1. 트리거 함수 생성: 제안이 accepted 될 때 연관된 workspace를 생성
CREATE OR REPLACE FUNCTION public.create_workspace_after_application_accept()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_workspace_id uuid;
    v_status text;
BEGIN
    -- Only act if status changed to accepted
    IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
        
        -- Check if workspace already exists for this proposal
        IF NEW.workspace_id IS NOT NULL THEN
            RETURN NEW;
        END IF;

        -- Create a new workspace
        INSERT INTO public.workspaces (
            brand_id,
            creator_id,
            status,
            created_at,
            updated_at
        ) VALUES (
            NEW.brand_id,
            NEW.creator_id,
            'active',
            NOW(),
            NOW()
        ) RETURNING id INTO v_workspace_id;

        -- Update the proposal with the new workspace_id
        NEW.workspace_id = v_workspace_id;

        -- Optionally, send a welcome message to the workspace
        INSERT INTO public.messages (
            workspace_id,
            sender_id,
            receiver_id,
            content,
            is_read,
            is_mock
        ) VALUES (
            v_workspace_id,
            NEW.brand_id, -- Using brand as system sender
            NEW.creator_id,
            '📄 [시스템] 제안이 수락되어 워크스페이스가 생성되었습니다. 협업을 시작해보세요!',
            false,
            true
        );
    END IF;

    RETURN NEW;
END;
$$;

-- 2. 각 제안 테이블에 트리거 부착
-- 2-1. moment_proposals
DROP TRIGGER IF EXISTS trg_create_workspace_on_moment_accept ON public.moment_proposals;
CREATE TRIGGER trg_create_workspace_on_moment_accept
    BEFORE UPDATE OF status ON public.moment_proposals
    FOR EACH ROW
    EXECUTE FUNCTION public.create_workspace_after_application_accept();

-- 2-2. campaign_applications
DROP TRIGGER IF EXISTS trg_create_workspace_on_campaign_accept ON public.campaign_applications;
CREATE TRIGGER trg_create_workspace_on_campaign_accept
    BEFORE UPDATE OF status ON public.campaign_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.create_workspace_after_application_accept();

-- 2-3. product_applications
DROP TRIGGER IF EXISTS trg_create_workspace_on_product_accept ON public.product_applications;
CREATE TRIGGER trg_create_workspace_on_product_accept
    BEFORE UPDATE OF status ON public.product_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.create_workspace_after_application_accept();

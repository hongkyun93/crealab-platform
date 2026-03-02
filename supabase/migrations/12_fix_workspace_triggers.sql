-- 1. moment_proposals 전용 트리거
CREATE OR REPLACE FUNCTION public.create_workspace_on_moment_accept()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_workspace_id uuid;
BEGIN
    IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
        IF NEW.workspace_id IS NOT NULL THEN RETURN NEW; END IF;

        INSERT INTO public.workspaces (brand_id, creator_id, original_proposal_id, original_proposal_type, status, created_at, updated_at)
        VALUES (NEW.brand_id, NEW.creator_id, NEW.id, 'moment', 'active', NOW(), NOW())
        RETURNING id INTO v_workspace_id;

        NEW.workspace_id = v_workspace_id;

        INSERT INTO public.messages (workspace_id, sender_id, receiver_id, content, is_read, is_mock)
        VALUES (v_workspace_id, NEW.brand_id, NEW.creator_id, '📄 [시스템] 모먼트 제안이 수락되어 워크스페이스가 생성되었습니다.', false, true);
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_create_workspace_on_moment_accept ON public.moment_proposals;
CREATE TRIGGER trg_create_workspace_on_moment_accept
    BEFORE UPDATE OF status ON public.moment_proposals
    FOR EACH ROW EXECUTE FUNCTION public.create_workspace_on_moment_accept();

-- 2. product_applications 전용 트리거
CREATE OR REPLACE FUNCTION public.create_workspace_on_product_accept()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_workspace_id uuid;
BEGIN
    IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
        IF NEW.workspace_id IS NOT NULL THEN RETURN NEW; END IF;

        INSERT INTO public.workspaces (brand_id, creator_id, original_proposal_id, original_proposal_type, status, created_at, updated_at)
        VALUES (NEW.brand_id, NEW.creator_id, NEW.id, 'product', 'active', NOW(), NOW())
        RETURNING id INTO v_workspace_id;

        NEW.workspace_id = v_workspace_id;

        INSERT INTO public.messages (workspace_id, sender_id, receiver_id, content, is_read, is_mock)
        VALUES (v_workspace_id, NEW.brand_id, NEW.creator_id, '📄 [시스템] 제품 제안이 수락되어 워크스페이스가 생성되었습니다.', false, true);
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_create_workspace_on_product_accept ON public.product_applications;
CREATE TRIGGER trg_create_workspace_on_product_accept
    BEFORE UPDATE OF status ON public.product_applications
    FOR EACH ROW EXECUTE FUNCTION public.create_workspace_on_product_accept();

-- 3. campaign_applications 전용 트리거
CREATE OR REPLACE FUNCTION public.create_workspace_on_campaign_accept()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_workspace_id uuid;
    v_brand_id uuid;
BEGIN
    IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
        IF NEW.workspace_id IS NOT NULL THEN RETURN NEW; END IF;

        SELECT brand_id INTO v_brand_id FROM public.campaigns WHERE id = NEW.campaign_id LIMIT 1;
        
        IF v_brand_id IS NULL THEN
            RAISE EXCEPTION 'Campaign not found or brand_id missing';
        END IF;

        INSERT INTO public.workspaces (brand_id, creator_id, original_proposal_id, original_proposal_type, status, created_at, updated_at)
        VALUES (v_brand_id, NEW.creator_id, NEW.id, 'campaign', 'active', NOW(), NOW())
        RETURNING id INTO v_workspace_id;

        NEW.workspace_id = v_workspace_id;

        INSERT INTO public.messages (workspace_id, sender_id, receiver_id, content, is_read, is_mock)
        VALUES (v_workspace_id, v_brand_id, NEW.creator_id, '📄 [시스템] 캠페인 제안이 수락되어 워크스페이스가 생성되었습니다.', false, true);
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_create_workspace_on_campaign_accept ON public.campaign_applications;
CREATE TRIGGER trg_create_workspace_on_campaign_accept
    BEFORE UPDATE OF status ON public.campaign_applications
    FOR EACH ROW EXECUTE FUNCTION public.create_workspace_on_campaign_accept();


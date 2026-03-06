-- Migration 51: Add MCN Proxy Audit Logs to Proposals and Workspaces
-- Adds `accepted_by_mcn_admin` to track which MCN admin accepted a proposal on behalf of a creator.

-- 1. Create columns on the proposal tables
ALTER TABLE public.moment_proposals
ADD COLUMN accepted_by_mcn_admin UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.product_applications
ADD COLUMN accepted_by_mcn_admin UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.campaign_applications
ADD COLUMN accepted_by_mcn_admin UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Create the column on the workspaces table to persist the accepted status long-term
ALTER TABLE public.workspaces
ADD COLUMN accepted_by_mcn_admin UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. Add column comments for documentation
COMMENT ON COLUMN public.moment_proposals.accepted_by_mcn_admin IS 'Tracks if an MCN admin accepted this proposal on behalf of the creator via proxy';
COMMENT ON COLUMN public.product_applications.accepted_by_mcn_admin IS 'Tracks if an MCN admin accepted this application on behalf of the creator via proxy';
COMMENT ON COLUMN public.campaign_applications.accepted_by_mcn_admin IS 'Tracks if an MCN admin accepted this campaign application on behalf of the creator via proxy';
COMMENT ON COLUMN public.workspaces.accepted_by_mcn_admin IS 'Tracks if an MCN admin accepted the original root proposal on behalf of the creator via proxy';

-- 4. Update Workspace Database Triggers to propagate the Audit Log

-- 4-1. moment_proposals trigger
CREATE OR REPLACE FUNCTION public.create_workspace_on_moment_accept()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_workspace_id uuid;
    v_project_title text;
BEGIN
    IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
        IF NEW.workspace_id IS NOT NULL THEN RETURN NEW; END IF;

        SELECT title INTO v_project_title
        FROM public.life_moments
        WHERE id = NEW.moment_id;

        IF v_project_title IS NULL THEN
            v_project_title := '모먼트 제안 워크스페이스';
        END IF;

        INSERT INTO public.workspaces (
            brand_id, creator_id, project_title, original_proposal_id, original_proposal_type, status, created_at, accepted_by_mcn_admin
        )
        VALUES (
            NEW.brand_id, NEW.creator_id, v_project_title, NEW.id, 'moment', 'active', NOW(), NEW.accepted_by_mcn_admin
        )
        RETURNING id INTO v_workspace_id;

        NEW.workspace_id = v_workspace_id;

        INSERT INTO public.messages (workspace_id, sender_id, receiver_id, content, is_read, is_mock)
        VALUES (v_workspace_id, NEW.brand_id, NEW.creator_id, '📄 [시스템] 모먼트 제안이 수락되어 워크스페이스가 생성되었습니다.', false, true);
    END IF;
    RETURN NEW;
END;
$$;

-- 4-2. product_applications trigger
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

        INSERT INTO public.workspaces (
            brand_id, creator_id, original_proposal_id, original_proposal_type, status, created_at, updated_at, accepted_by_mcn_admin
        )
        VALUES (
            NEW.brand_id, NEW.creator_id, NEW.id, 'product', 'active', NOW(), NOW(), NEW.accepted_by_mcn_admin
        )
        RETURNING id INTO v_workspace_id;

        NEW.workspace_id = v_workspace_id;

        INSERT INTO public.messages (workspace_id, sender_id, receiver_id, content, is_read, is_mock)
        VALUES (v_workspace_id, NEW.brand_id, NEW.creator_id, '📄 [시스템] 제품 제안이 수락되어 워크스페이스가 생성되었습니다.', false, true);
    END IF;
    RETURN NEW;
END;
$$;

-- 4-3. campaign_applications trigger
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

        INSERT INTO public.workspaces (
            brand_id, creator_id, original_proposal_id, original_proposal_type, status, created_at, updated_at, accepted_by_mcn_admin
        )
        VALUES (
            v_brand_id, NEW.creator_id, NEW.id, 'campaign', 'active', NOW(), NOW(), NEW.accepted_by_mcn_admin
        )
        RETURNING id INTO v_workspace_id;

        NEW.workspace_id = v_workspace_id;

        INSERT INTO public.messages (workspace_id, sender_id, receiver_id, content, is_read, is_mock)
        VALUES (v_workspace_id, v_brand_id, NEW.creator_id, '📄 [시스템] 캠페인 제안이 수락되어 워크스페이스가 생성되었습니다.', false, true);
    END IF;
    RETURN NEW;
END;
$$;

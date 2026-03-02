-- 01_add_workspaces_fks_and_rls.sql
-- Description: 워크스페이스 테이블의 외래 키(FK) 참조 및 연관 테이블들의 RLS(Row Level Security) 정책을 업데이트합니다.
-- Note: 기존 제안 테이블(moment_proposals 등)에서 workspaces 테이블로 책임이 이관됨에 따라 접근 권한을 갱신합니다.

-- 1. FOREIGN KEY CONSTRAINTS (외래 키 제약 조건)

-- 1.1 workspaces 테이블 기본 참조
ALTER TABLE public.workspaces
    ADD CONSTRAINT workspaces_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.workspaces
    ADD CONSTRAINT workspaces_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.workspaces
    ADD CONSTRAINT workspaces_brand_team_id_fkey FOREIGN KEY (brand_team_id) REFERENCES public.teams(id) ON DELETE SET NULL;

ALTER TABLE public.workspaces
    ADD CONSTRAINT workspaces_creator_team_id_fkey FOREIGN KEY (creator_team_id) REFERENCES public.teams(id) ON DELETE SET NULL;

-- 1.2 messages 테이블의 workspaces 참조
ALTER TABLE public.messages
    ADD CONSTRAINT messages_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- 1.3 workspace_files 테이블의 workspaces 참조
ALTER TABLE public.workspace_files
    ADD CONSTRAINT workspace_files_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- 1.4 submission_feedback 테이블의 workspaces 참조
ALTER TABLE public.submission_feedback
    ADD CONSTRAINT submission_feedback_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- 1.5 campaign_performance 테이블의 workspaces 참조
ALTER TABLE public.campaign_performance
    ADD CONSTRAINT campaign_performance_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- 1.6 settlements 테이블의 workspaces 참조
ALTER TABLE public.settlements
    ADD CONSTRAINT settlements_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


-- 2. ROW LEVEL SECURITY (RLS) POLICIES (보안 정책 업데이트)

-- 2.1 workspaces 테이블 RLS 정리
DO $$
BEGIN
    DROP POLICY IF EXISTS "workspace members can insert" ON public.workspaces;
    DROP POLICY IF EXISTS "workspace members can view" ON public.workspaces;
    DROP POLICY IF EXISTS "workspace members can update" ON public.workspaces;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

CREATE POLICY "workspaces_insert" ON public.workspaces FOR INSERT WITH CHECK (
    auth.uid() = brand_id OR auth.uid() = creator_id OR 
    brand_team_id IN (SELECT public.get_user_team_ids(auth.uid())) OR
    creator_team_id IN (SELECT public.get_user_team_ids(auth.uid()))
);

CREATE POLICY "workspaces_select" ON public.workspaces FOR SELECT USING (
    auth.uid() = brand_id OR auth.uid() = creator_id OR public.is_admin() OR
    brand_team_id IN (SELECT public.get_user_team_ids(auth.uid())) OR
    creator_team_id IN (SELECT public.get_user_team_ids(auth.uid()))
);

CREATE POLICY "workspaces_update" ON public.workspaces FOR UPDATE USING (
    auth.uid() = brand_id OR auth.uid() = creator_id OR public.is_admin() OR
    brand_team_id IN (SELECT public.get_user_team_ids(auth.uid())) OR
    creator_team_id IN (SELECT public.get_user_team_ids(auth.uid()))
);


-- 2.2 messages 테이블 RLS 변경 (proposal_id -> workspace_id 의존으로 변경됨에 따라 간소화)
DO $$
BEGIN
    DROP POLICY IF EXISTS "messages_insert" ON public.messages;
    DROP POLICY IF EXISTS "messages_select" ON public.messages;
    DROP POLICY IF EXISTS "messages_update" ON public.messages;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

CREATE POLICY "messages_insert" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "messages_select" ON public.messages FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id OR public.is_admin()
);
CREATE POLICY "messages_update" ON public.messages FOR UPDATE USING (auth.uid() = receiver_id);


-- 2.3 submission_feedback 테이블 RLS 수정 (can_access_submission_feedback 함수 의존성 제거)
DO $$
BEGIN
    DROP POLICY IF EXISTS "submission_feedback_insert" ON public.submission_feedback;
    DROP POLICY IF EXISTS "submission_feedback_select" ON public.submission_feedback;
    DROP POLICY IF EXISTS "submission_feedback_update" ON public.submission_feedback;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- 이제 feedback은 workspaces를 참조하므로 해당 workspace에 접근 권한이 있으면 조회 가능
CREATE POLICY "submission_feedback_insert" ON public.submission_feedback FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "submission_feedback_select" ON public.submission_feedback FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.workspaces w 
        WHERE w.id = workspace_id AND (
            w.brand_id = auth.uid() OR w.creator_id = auth.uid() OR public.is_admin() OR
            w.brand_team_id IN (SELECT public.get_user_team_ids(auth.uid())) OR
            w.creator_team_id IN (SELECT public.get_user_team_ids(auth.uid()))
        )
    )
);
CREATE POLICY "submission_feedback_update" ON public.submission_feedback FOR UPDATE USING (auth.uid() = sender_id);

-- 기존에 사용하던 복잡한 RLS 체크 함수는 더 이상 필요 없으므로 삭제
DROP FUNCTION IF EXISTS public.can_access_submission_feedback(uuid);

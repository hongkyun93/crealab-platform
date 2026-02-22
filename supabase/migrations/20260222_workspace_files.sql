-- workspace_files: 워크스테이션 공유 파일 테이블
-- brand_proposals, proposals(campaign), moment_proposals 모두 workspace_id UUID 보유
-- → workspace_id를 기본 격리 키로 사용하고, 없는 경우 proposal_id/brand_proposal_id로 fallback

CREATE TABLE IF NOT EXISTS public.workspace_files (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id uuid,              -- 모든 proposal 타입 공통 격리 키 (FK 없음 — 타입별 FK 불가)
    brand_proposal_id uuid REFERENCES public.brand_proposals(id) ON DELETE CASCADE,
    proposal_id uuid,               -- campaign_application ID (proposals 테이블 FK 없음 — uuid 타입만 보장)
    moment_proposal_id uuid,        -- moment_proposal ID (moment_proposals 테이블 FK 없음)
    uploader_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    file_name text NOT NULL,
    file_url text NOT NULL,
    file_size integer,              -- bytes
    file_type text,                 -- MIME type (application/pdf, application/msword, etc.)
    created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.workspace_files ENABLE ROW LEVEL SECURITY;

-- 인증된 사용자는 조회 가능 (워크스테이션 참여자 제한은 클라이언트에서 proposal 로드 시 처리)
CREATE POLICY "workspace_files_select" ON public.workspace_files
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- 업로더 본인만 삽입 가능
CREATE POLICY "workspace_files_insert" ON public.workspace_files
    FOR INSERT WITH CHECK (auth.uid() = uploader_id);

-- 업로더 본인만 삭제 가능
CREATE POLICY "workspace_files_delete" ON public.workspace_files
    FOR DELETE USING (auth.uid() = uploader_id);

-- 빠른 조회를 위한 인덱스
CREATE INDEX IF NOT EXISTS workspace_files_workspace_id_idx ON public.workspace_files(workspace_id);
CREATE INDEX IF NOT EXISTS workspace_files_brand_proposal_id_idx ON public.workspace_files(brand_proposal_id);
CREATE INDEX IF NOT EXISTS workspace_files_proposal_id_idx ON public.workspace_files(proposal_id);
CREATE INDEX IF NOT EXISTS workspace_files_moment_proposal_id_idx ON public.workspace_files(moment_proposal_id);

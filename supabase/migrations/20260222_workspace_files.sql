-- 기존 테이블/정책/인덱스 완전 초기화 (재실행 안전)
DROP TABLE IF EXISTS public.workspace_files CASCADE;

CREATE TABLE public.workspace_files (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id uuid,              -- 모든 proposal 타입 공통 격리 키
    product_application_id uuid REFERENCES public.product_applications(id) ON DELETE CASCADE,
    proposal_id uuid,               -- campaign_application ID
    moment_proposal_id uuid,        -- moment_proposal ID
    uploader_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    file_name text NOT NULL,
    file_url text NOT NULL,
    file_size integer,              -- bytes
    file_type text,                 -- MIME type
    created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.workspace_files ENABLE ROW LEVEL SECURITY;

-- 기존 정책 제거 후 재생성 (재실행 시 중복 방지)
DROP POLICY IF EXISTS "workspace_files_select" ON public.workspace_files;
DROP POLICY IF EXISTS "workspace_files_insert" ON public.workspace_files;
DROP POLICY IF EXISTS "workspace_files_delete" ON public.workspace_files;

-- 인증된 사용자는 조회 가능
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
CREATE INDEX IF NOT EXISTS workspace_files_product_application_id_idx ON public.workspace_files(product_application_id);
CREATE INDEX IF NOT EXISTS workspace_files_proposal_id_idx ON public.workspace_files(proposal_id);
CREATE INDEX IF NOT EXISTS workspace_files_moment_proposal_id_idx ON public.workspace_files(moment_proposal_id);

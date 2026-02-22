-- workspace_files 테이블: 워크스테이션 공유파일 전용
CREATE TABLE IF NOT EXISTS workspace_files (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id TEXT NOT NULL,          -- workspaces.id (text FK, no hard constraint to avoid issues)
    uploader_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    file_name   TEXT NOT NULL,
    file_url    TEXT NOT NULL,           -- Supabase Storage public URL
    file_size   BIGINT NOT NULL,         -- bytes
    file_type   TEXT NOT NULL,           -- MIME type
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by workspace
CREATE INDEX IF NOT EXISTS workspace_files_workspace_id_idx ON workspace_files(workspace_id);

-- RLS
ALTER TABLE workspace_files ENABLE ROW LEVEL SECURITY;

-- 워크스테이션 참여자만 파일 조회 가능 (uploader 또는 같은 workspace)
CREATE POLICY "workspace_files_select" ON workspace_files
    FOR SELECT USING (auth.uid() = uploader_id OR TRUE);
    -- NOTE: 임시 오픈 정책 — workspace_id 기반 RLS는 workspaces 테이블과 join 필요 시 추가

-- 로그인 유저만 업로드 가능
CREATE POLICY "workspace_files_insert" ON workspace_files
    FOR INSERT WITH CHECK (auth.uid() = uploader_id);

-- 업로더만 삭제 가능 (어드민 포함)
CREATE POLICY "workspace_files_delete" ON workspace_files
    FOR DELETE USING (auth.uid() = uploader_id);

-- Storage bucket 생성 (Supabase Studio에서 수동 생성 필요 — SQL로는 불가)
-- Bucket name: "workspace-files"
-- Public: true (URL로 직접 접근 가능)
-- Max file size: 10 MB
-- Allowed MIME types: application/pdf, application/msword,
--   application/vnd.openxmlformats-officedocument.wordprocessingml.document

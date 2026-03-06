-- ─── Settlement: proposal_id를 nullable로 변경 ─────────────────────────────
-- Supabase 대시보드 → SQL Editor에서 실행
-- 이유: 직접 입력 정산 / 외부 광고비 등 proposal 없이도 정산 가능하게
ALTER TABLE public.settlements
    ALTER COLUMN proposal_id DROP NOT NULL;

ALTER TABLE public.settlements
    ALTER COLUMN workspace_id DROP NOT NULL;

-- 적용 후 확인
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'settlements'
  AND column_name  IN ('proposal_id', 'workspace_id');

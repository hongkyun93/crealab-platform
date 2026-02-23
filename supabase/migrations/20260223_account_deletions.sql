-- =====================================================
-- account_deletions 감사 로그 테이블
-- Created: 2026-02-23
-- Purpose: 계정 탈퇴 시 감사 기록 보존
--          (법적 분쟁 대비, GDPR 유사 요건)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.account_deletions (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid NOT NULL,
  email      text,
  reason     text,
  deleted_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: service_role(admin client)만 insert 가능, 일반 사용자 접근 차단
ALTER TABLE public.account_deletions ENABLE ROW LEVEL SECURITY;

-- 일반 사용자는 조회/수정 불가 (service_role은 RLS 우회)
-- INSERT는 API route에서 createAdminClient() (service_role)로만 호출됨
-- → 별도 정책 불필요, RLS enable만으로 일반 사용자 차단됨

-- =====================================================
-- social_channels: Instagram OAuth 컬럼 추가
-- Created: 2026-02-24
-- =====================================================

ALTER TABLE public.social_channels
  ADD COLUMN IF NOT EXISTS ig_user_id text,
  ADD COLUMN IF NOT EXISTS ig_access_token text;

-- ig_user_id 인덱스 (인사이트 조회 시 빠른 조회)
CREATE INDEX IF NOT EXISTS idx_social_channels_ig_user_id
  ON public.social_channels(ig_user_id) WHERE ig_user_id IS NOT NULL;

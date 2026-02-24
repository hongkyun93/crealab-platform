-- =====================================================
-- social_channels: ig_demographics JSON 컬럼 추가
-- Created: 2026-02-24
-- =====================================================

ALTER TABLE public.social_channels
  ADD COLUMN IF NOT EXISTS ig_demographics jsonb;

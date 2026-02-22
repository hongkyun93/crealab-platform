-- =====================================================
-- Fix life_moments category data
-- Created: 2026-02-22
-- Purpose: Backfill category from tags[0] for moments
--          where category is NULL or empty string
-- =====================================================

-- tags 배열의 첫 번째 값을 category로 사용
-- tags가 없거나 빈 경우 '기타'로 채움
UPDATE public.life_moments
SET category = COALESCE(
    NULLIF(tags[1], ''),  -- text[] 배열의 첫 번째 요소 (1-indexed)
    '기타'
)
WHERE category IS NULL OR category = '';

-- 확인
SELECT
    COUNT(*) FILTER (WHERE category IS NULL OR category = '') AS still_empty,
    COUNT(*) FILTER (WHERE category IS NOT NULL AND category != '') AS has_category
FROM public.life_moments;

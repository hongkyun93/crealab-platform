-- 45_add_brand_note_to_contest_applications.sql
-- 브랜드가 지원자에 대한 내부 메모를 남길 수 있는 컬럼 추가

ALTER TABLE public.ad_contest_applications
ADD COLUMN IF NOT EXISTS brand_note TEXT DEFAULT NULL;

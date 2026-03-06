-- 42_add_maintenance_period_to_contests.sql
-- ad_contests 테이블에 maintenance_period 컬럼 추가
-- 2차 사용 유지 기간 (일 단위, 기본값 60일)

ALTER TABLE public.ad_contests
    ADD COLUMN IF NOT EXISTS maintenance_period integer DEFAULT 60;

COMMENT ON COLUMN public.ad_contests.maintenance_period IS '2차 사용 유지 기간 (일 단위)';

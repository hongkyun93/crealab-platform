-- Add maintenance_period to ad_contests
ALTER TABLE public.ad_contests
ADD COLUMN maintenance_period INTEGER NOT NULL DEFAULT 60;

COMMENT ON COLUMN public.ad_contests.maintenance_period IS '최소 영상 유지 기간 (일)';

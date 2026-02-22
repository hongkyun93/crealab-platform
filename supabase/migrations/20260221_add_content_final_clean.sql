-- Add content final/clean URL columns for 2-stage content submission
-- content_final_url: 최종본 (자막/효과 포함)
-- content_clean_url: 클린본 (2차 활용용 원본)

ALTER TABLE product_applications ADD COLUMN IF NOT EXISTS content_final_url TEXT;
ALTER TABLE product_applications ADD COLUMN IF NOT EXISTS content_clean_url TEXT;
ALTER TABLE product_applications ADD COLUMN IF NOT EXISTS content_submission_file_url TEXT;
ALTER TABLE product_applications ADD COLUMN IF NOT EXISTS content_submission_version NUMERIC;
ALTER TABLE product_applications ADD COLUMN IF NOT EXISTS content_submission_date TIMESTAMPTZ;

ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS content_final_url TEXT;
ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS content_clean_url TEXT;

ALTER TABLE moment_proposals ADD COLUMN IF NOT EXISTS content_final_url TEXT;
ALTER TABLE moment_proposals ADD COLUMN IF NOT EXISTS content_clean_url TEXT;
ALTER TABLE moment_proposals ADD COLUMN IF NOT EXISTS content_submission_file_url TEXT;
ALTER TABLE moment_proposals ADD COLUMN IF NOT EXISTS content_submission_version NUMERIC;
ALTER TABLE moment_proposals ADD COLUMN IF NOT EXISTS content_submission_date TIMESTAMPTZ;

-- Full sync of moment_proposals to match brand_proposals structure

ALTER TABLE public.moment_proposals
ADD COLUMN IF NOT EXISTS product_name TEXT,
ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 'gift',
ADD COLUMN IF NOT EXISTS compensation_amount TEXT,
ADD COLUMN IF NOT EXISTS has_incentive BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS incentive_detail TEXT,
ADD COLUMN IF NOT EXISTS content_type TEXT,
-- message already exists
-- status already exists
ADD COLUMN IF NOT EXISTS is_mock BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS contract_content TEXT,
-- contract_status already exists
-- brand_signature already exists
-- influencer_signature already exists
-- created_at, updated_at already exist
ADD COLUMN IF NOT EXISTS brand_signed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS influencer_signed_at TIMESTAMP WITH TIME ZONE,

-- Shipping & Delivery
ADD COLUMN IF NOT EXISTS shipping_name TEXT,
ADD COLUMN IF NOT EXISTS shipping_phone TEXT,
ADD COLUMN IF NOT EXISTS shipping_address TEXT,
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
-- delivery_status already exists

-- Dates & Conditions
ADD COLUMN IF NOT EXISTS date_flexible BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS desired_date DATE,
ADD COLUMN IF NOT EXISTS video_guide TEXT DEFAULT 'brand_provided',
ADD COLUMN IF NOT EXISTS product_url TEXT,

-- Detailed Conditions (Text type to match brand_proposals)
ADD COLUMN IF NOT EXISTS condition_product_receipt_date TEXT,
ADD COLUMN IF NOT EXISTS condition_plan_sharing_date TEXT,
ADD COLUMN IF NOT EXISTS condition_draft_submission_date TEXT,
ADD COLUMN IF NOT EXISTS condition_final_submission_date TEXT,
ADD COLUMN IF NOT EXISTS condition_upload_date TEXT,
ADD COLUMN IF NOT EXISTS condition_maintenance_period TEXT,
ADD COLUMN IF NOT EXISTS condition_secondary_usage_period TEXT,
ADD COLUMN IF NOT EXISTS brand_condition_confirmed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS influencer_condition_confirmed BOOLEAN DEFAULT FALSE,

-- Content Submission
ADD COLUMN IF NOT EXISTS content_submission_url TEXT,
ADD COLUMN IF NOT EXISTS content_submission_file_url TEXT,
-- content_submission_status already exists
ADD COLUMN IF NOT EXISTS content_submission_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS content_submission_version NUMERIC(3,1) DEFAULT 1.0,

ADD COLUMN IF NOT EXISTS content_submission_url_2 TEXT,
ADD COLUMN IF NOT EXISTS content_submission_file_url_2 TEXT,
ADD COLUMN IF NOT EXISTS content_submission_status_2 TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS content_submission_date_2 TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS content_submission_version_2 NUMERIC(3,1) DEFAULT 0.9,

-- Application Fields
ADD COLUMN IF NOT EXISTS motivation TEXT,
ADD COLUMN IF NOT EXISTS content_plan TEXT,
ADD COLUMN IF NOT EXISTS portfolio_links TEXT[],
ADD COLUMN IF NOT EXISTS instagram_handle TEXT,
ADD COLUMN IF NOT EXISTS insight_screenshot TEXT;

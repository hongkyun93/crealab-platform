-- Migration: Video Review Panel support
-- Date: 20260222
-- Adds:
--   1. video_timestamp_seconds to submission_feedback: bookmarking feedback at exact video time
--   2. content_final_approved_at to all 3 proposal tables: brand final confirmation timestamp
--   3. content_revision_requested_at to all 3 proposal tables: brand review-complete timestamp
--      Set when brand clicks "검토 완료" → unlocks creator's revision upload

-- 1. submission_feedback: Add video timestamp for bookmark-style feedback
ALTER TABLE public.submission_feedback
  ADD COLUMN IF NOT EXISTS video_timestamp_seconds NUMERIC(8,2);

COMMENT ON COLUMN public.submission_feedback.video_timestamp_seconds
  IS 'If set, this feedback is a video bookmark at the given second. NULL = plain text feedback.';

-- 2. product_applications: Add brand final approval timestamp
ALTER TABLE public.product_applications
  ADD COLUMN IF NOT EXISTS content_final_approved_at TIMESTAMPTZ;

COMMENT ON COLUMN public.product_applications.content_final_approved_at
  IS 'Timestamp when brand gave final approval for the submitted content. Unlocks final/clean version upload for creator.';

-- 3. campaign_applications: same field
ALTER TABLE public.campaign_applications
  ADD COLUMN IF NOT EXISTS content_final_approved_at TIMESTAMPTZ;

COMMENT ON COLUMN public.campaign_applications.content_final_approved_at
  IS 'Timestamp when brand gave final approval for the submitted content.';

-- 4. moment_proposals: same field
ALTER TABLE public.moment_proposals
  ADD COLUMN IF NOT EXISTS content_final_approved_at TIMESTAMPTZ;

COMMENT ON COLUMN public.moment_proposals.content_final_approved_at
  IS 'Timestamp when brand gave final approval for the submitted content.';

-- 5. product_applications: content_revision_requested_at
ALTER TABLE public.product_applications
  ADD COLUMN IF NOT EXISTS content_revision_requested_at TIMESTAMPTZ;

COMMENT ON COLUMN public.product_applications.content_revision_requested_at
  IS 'Set when brand clicks "검토 완료". Unlocks revision upload for creator. Cleared (set NULL) after creator uploads a new revision.';

-- 6. campaign_applications: content_revision_requested_at
ALTER TABLE public.campaign_applications
  ADD COLUMN IF NOT EXISTS content_revision_requested_at TIMESTAMPTZ;

COMMENT ON COLUMN public.campaign_applications.content_revision_requested_at
  IS 'Set when brand clicks "검토 완료". Unlocks revision upload for creator.';

-- 7. moment_proposals: content_revision_requested_at
ALTER TABLE public.moment_proposals
  ADD COLUMN IF NOT EXISTS content_revision_requested_at TIMESTAMPTZ;

COMMENT ON COLUMN public.moment_proposals.content_revision_requested_at
  IS 'Set when brand clicks "검토 완료". Unlocks revision upload for creator.';


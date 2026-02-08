-- Rename boolean column for safety
ALTER TABLE public.brand_proposals RENAME COLUMN video_guide TO video_guide_old;

-- Add new text column
ALTER TABLE public.brand_proposals ADD COLUMN video_guide text NOT NULL DEFAULT 'brand_provided';

-- Migrate data
UPDATE public.brand_proposals
SET video_guide = CASE
    WHEN video_guide_old = true THEN 'brand_provided'
    ELSE 'creator_planned'
END;

-- Drop old column (Optional: keep for backup or drop later)
ALTER TABLE public.brand_proposals DROP COLUMN video_guide_old;

-- Notify schema reload
NOTIFY pgrst, 'reload schema';

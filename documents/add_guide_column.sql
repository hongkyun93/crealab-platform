-- Add guide column to influencer_events table
ALTER TABLE public.influencer_events
ADD COLUMN IF NOT EXISTS guide text;

-- Notify successful execution
DO $$
BEGIN
    RAISE NOTICE 'Added guide column to influencer_events table';
END $$;

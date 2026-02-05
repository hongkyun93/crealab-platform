-- Add guide column to influencer_events table
ALTER TABLE public.influencer_events
ADD COLUMN IF NOT EXISTS guide text;
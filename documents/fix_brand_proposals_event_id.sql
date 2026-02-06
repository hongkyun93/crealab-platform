-- Add event_id to brand_proposals to link offers to specific moments
ALTER TABLE public.brand_proposals 
ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES public.influencer_events(id) ON DELETE SET NULL;

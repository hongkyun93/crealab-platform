DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'brand_proposals'
        AND column_name = 'event_id'
    ) THEN
        ALTER TABLE public.brand_proposals
        ADD COLUMN event_id uuid references public.influencer_events(id);
    END IF;
END $$;

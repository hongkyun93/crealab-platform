-- Add missing application fields to brand_proposals to align with campaign_proposals
-- This allows brands to receive detailed applications (motivation, content plan) directly on products.

DO $$ 
BEGIN
    -- Motivation
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brand_proposals' AND column_name = 'motivation') THEN
        ALTER TABLE public.brand_proposals ADD COLUMN motivation text;
    END IF;

    -- Content Plan
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brand_proposals' AND column_name = 'content_plan') THEN
        ALTER TABLE public.brand_proposals ADD COLUMN content_plan text;
    END IF;

    -- Portfolio Links (Array of text)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brand_proposals' AND column_name = 'portfolio_links') THEN
        ALTER TABLE public.brand_proposals ADD COLUMN portfolio_links text[];
    END IF;

    -- Instagram Handle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brand_proposals' AND column_name = 'instagram_handle') THEN
        ALTER TABLE public.brand_proposals ADD COLUMN instagram_handle text;
    END IF;

    -- Insight Screenshot
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brand_proposals' AND column_name = 'insight_screenshot') THEN
        ALTER TABLE public.brand_proposals ADD COLUMN insight_screenshot text;
    END IF;

END $$;

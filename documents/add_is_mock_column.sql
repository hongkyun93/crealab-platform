-- Add is_mock column to tables to identify fake/test data
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_mock BOOLEAN DEFAULT FALSE;
ALTER TABLE public.brand_products ADD COLUMN IF NOT EXISTS is_mock BOOLEAN DEFAULT FALSE;
ALTER TABLE public.influencer_events ADD COLUMN IF NOT EXISTS is_mock BOOLEAN DEFAULT FALSE;
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS is_mock BOOLEAN DEFAULT FALSE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_mock BOOLEAN DEFAULT FALSE;

-- Update RLS if necessary (usually not needed for just a new column, but good to know)
-- If we want to allow guests to write mock data, we might need specific policies,
-- but the user mostly wanted existing data to be labeled.

-- Ensure existing data is marked (though most won't have it yet)
COMMENT ON COLUMN public.profiles.is_mock IS 'Flag to identify mock/guest data for easy cleanup';

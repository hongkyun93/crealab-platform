-- Add channel_name and channel_url to campaign_applications
ALTER TABLE public.campaign_applications 
ADD COLUMN IF NOT EXISTS channel_name text,
ADD COLUMN IF NOT EXISTS channel_url text;

-- Add channel_name and channel_url to brand_proposals (for creator offers)
ALTER TABLE public.brand_proposals 
ADD COLUMN IF NOT EXISTS channel_name text,
ADD COLUMN IF NOT EXISTS channel_url text;

-- Add comment
COMMENT ON COLUMN public.campaign_applications.channel_name IS 'The social channel name (e.g., Instagram, YouTube) the creator intends to use';
COMMENT ON COLUMN public.campaign_applications.channel_url IS 'The specific URL of the creators channel/profile';

COMMENT ON COLUMN public.brand_proposals.channel_name IS 'The social channel name (e.g., Instagram, YouTube) the creator intends to use for this offer';
COMMENT ON COLUMN public.brand_proposals.channel_url IS 'The specific URL of the creators channel/profile for this offer';

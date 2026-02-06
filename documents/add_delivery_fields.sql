-- Add delivery related columns to brand_proposals (Direct Offers)
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS shipping_name text;
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS shipping_phone text;
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS shipping_address text;
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS tracking_number text;
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS delivery_status text DEFAULT 'pending'; -- pending, shipped, delivered

-- Add delivery related columns to proposals (Campaign Applications)
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS shipping_name text;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS shipping_phone text;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS shipping_address text;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS tracking_number text;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS delivery_status text DEFAULT 'pending';

-- Notify PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';

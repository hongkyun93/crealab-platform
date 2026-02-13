-- Fix missing RLS policies for campaigns table

-- 1. Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Campaigns are viewable by everyone" ON public.campaigns;
DROP POLICY IF EXISTS "Brands can insert campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Brands can update campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Brands can delete campaigns" ON public.campaigns;

-- 3. Create policies
-- Public Read Access: Everyone can see campaigns (required for Creators to see details)
CREATE POLICY "Campaigns are viewable by everyone" 
ON public.campaigns FOR SELECT 
USING ( true );

-- Brand Write Access: Only the owner brand can modify
CREATE POLICY "Brands can insert campaigns" 
ON public.campaigns FOR INSERT 
WITH CHECK ( auth.uid() = brand_id );

CREATE POLICY "Brands can update campaigns" 
ON public.campaigns FOR UPDATE 
USING ( auth.uid() = brand_id );

CREATE POLICY "Brands can delete campaigns" 
ON public.campaigns FOR DELETE 
USING ( auth.uid() = brand_id );

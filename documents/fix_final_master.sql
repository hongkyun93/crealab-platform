-- 🛠️ FINAL MASTER PERMISSION FIX SCRIPT (V2 - Includes Storage)
-- Run this script to fix EVERYTHING: Tables, Permissions, and Storage.
-- It safely resets policies without deleting your data.

-- ==========================================
-- 1. PROFILES & USERS
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING ( true );
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK ( auth.uid() = id );
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING ( auth.uid() = id );

-- ==========================================
-- 2. INFLUENCER DETAILS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.influencer_details (
  id uuid REFERENCES public.profiles(id) PRIMARY KEY,
  instagram_handle text,
  followers_count integer,
  tier text,
  tags text[],
  price_video integer,
  price_feed integer,
  secondary_rights boolean DEFAULT false,
  usage_rights_month integer,
  usage_rights_price integer,
  auto_dm_month integer,
  auto_dm_price integer,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.influencer_details ENABLE ROW LEVEL SECURITY;

-- Ensure columns exist if table already existed
ALTER TABLE public.influencer_details ADD COLUMN IF NOT EXISTS price_video integer;
ALTER TABLE public.influencer_details ADD COLUMN IF NOT EXISTS price_feed integer;
ALTER TABLE public.influencer_details ADD COLUMN IF NOT EXISTS secondary_rights boolean DEFAULT false;
ALTER TABLE public.influencer_details ADD COLUMN IF NOT EXISTS usage_rights_month integer;
ALTER TABLE public.influencer_details ADD COLUMN IF NOT EXISTS usage_rights_price integer;
ALTER TABLE public.influencer_details ADD COLUMN IF NOT EXISTS auto_dm_month integer;
ALTER TABLE public.influencer_details ADD COLUMN IF NOT EXISTS auto_dm_price integer;

DROP POLICY IF EXISTS "Influencer details viewable by everyone" ON influencer_details;
DROP POLICY IF EXISTS "Influencers can update own details" ON influencer_details;
DROP POLICY IF EXISTS "Influencers can insert own details" ON influencer_details;

CREATE POLICY "Influencer details viewable by everyone" ON influencer_details FOR SELECT USING ( true );
CREATE POLICY "Influencers can update own details" ON influencer_details FOR UPDATE USING ( auth.uid() = id );
CREATE POLICY "Influencers can insert own details" ON influencer_details FOR INSERT WITH CHECK ( auth.uid() = id );

-- ==========================================
-- 3. BRAND PRODUCTS (DB Table)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.brand_products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  image_url text,
  price integer DEFAULT 0,
  category text,
  selling_points text,
  required_shots text,
  website_url text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.brand_products ENABLE ROW LEVEL SECURITY;

-- Reset Policies
DROP POLICY IF EXISTS "Brand products are viewable by everyone" ON brand_products;
DROP POLICY IF EXISTS "Brands can insert their own products" ON brand_products;
DROP POLICY IF EXISTS "Brands can update their own products" ON brand_products;
DROP POLICY IF EXISTS "Brands can delete their own products" ON brand_products;
DROP POLICY IF EXISTS "products_viewable_by_everyone" ON brand_products;
DROP POLICY IF EXISTS "products_insertable_by_owner" ON brand_products;
DROP POLICY IF EXISTS "products_updatable_by_owner" ON brand_products;
DROP POLICY IF EXISTS "products_deletable_by_owner" ON brand_products;

-- Create Unified Policies
CREATE POLICY "Brand products are viewable by everyone" ON brand_products FOR SELECT USING ( true );
CREATE POLICY "Brands can insert their own products" ON brand_products FOR INSERT WITH CHECK ( auth.uid() = brand_id );
CREATE POLICY "Brands can update their own products" ON brand_products FOR UPDATE USING ( auth.uid() = brand_id );
CREATE POLICY "Brands can delete their own products" ON brand_products FOR DELETE USING ( auth.uid() = brand_id );

-- ==========================================
-- 4. INFLUENCER EVENTS (MOMENTS)
-- ==========================================
ALTER TABLE public.influencer_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Influencer events are viewable by everyone" ON influencer_events;
DROP POLICY IF EXISTS "Influencers can insert their own events" ON influencer_events;
DROP POLICY IF EXISTS "Influencers can update their own events" ON influencer_events;
DROP POLICY IF EXISTS "Influencers can delete their own events" ON influencer_events;

CREATE POLICY "Influencer events are viewable by everyone" ON influencer_events FOR SELECT USING ( true );
CREATE POLICY "Influencers can insert their own events" ON influencer_events FOR INSERT WITH CHECK ( auth.uid() = influencer_id );
CREATE POLICY "Influencers can update their own events" ON influencer_events FOR UPDATE USING ( auth.uid() = influencer_id );
CREATE POLICY "Influencers can delete their own events" ON influencer_events FOR DELETE USING ( auth.uid() = influencer_id );

-- ==========================================
-- 5. CAMPAIGNS & PROPOSALS
-- ==========================================
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.brand_proposals ENABLE ROW LEVEL SECURITY; 

DROP POLICY IF EXISTS "Campaigns viewable by everyone" ON campaigns;
DROP POLICY IF EXISTS "Brands can manage campaigns" ON campaigns;
DROP POLICY IF EXISTS "Brand proposals viewable by sender and receiver" ON brand_proposals;
DROP POLICY IF EXISTS "Brands can create proposals" ON brand_proposals;
DROP POLICY IF EXISTS "Parties can update status" ON brand_proposals;
DROP POLICY IF EXISTS "Brands can delete proposals" ON brand_proposals;

CREATE POLICY "Campaigns viewable by everyone" ON campaigns FOR SELECT USING (true);
CREATE POLICY "Brands can manage campaigns" ON campaigns FOR ALL USING (auth.uid() = brand_id);

CREATE POLICY "Brand proposals viewable by sender and receiver" ON brand_proposals FOR SELECT USING ( auth.uid() = brand_id OR auth.uid() = influencer_id );
CREATE POLICY "Brands can create proposals" ON brand_proposals FOR INSERT WITH CHECK ( auth.uid() = brand_id );
CREATE POLICY "Parties can update status" ON brand_proposals FOR UPDATE USING ( auth.uid() = brand_id OR auth.uid() = influencer_id );
CREATE POLICY "Brands can delete proposals" ON brand_proposals FOR DELETE USING ( auth.uid() = brand_id );

-- ==========================================
-- 6. MESSAGES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  proposal_id uuid REFERENCES public.brand_proposals(id) ON DELETE SET NULL, 
  sender_id uuid REFERENCES public.profiles(id) NOT NULL,
  receiver_id uuid REFERENCES public.profiles(id) NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Messages viewable by sender and receiver" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update messages" ON messages;

CREATE POLICY "Messages viewable by sender and receiver" ON messages FOR SELECT USING ( auth.uid() = sender_id OR auth.uid() = receiver_id );
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK ( auth.uid() = sender_id );
CREATE POLICY "Users can update messages" ON messages FOR UPDATE USING ( auth.uid() = sender_id OR auth.uid() = receiver_id );

-- ==========================================
-- 7. STORAGE (Product Images) - NEW ADDITION
-- ==========================================
-- Ensure bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Reset Storage Policies (Be careful not to break other buckets if any, filtering by bucket_id)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;

-- Re-create Policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- ==========================================
-- 8. GRANT ALL PERMISSIONS
-- ==========================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

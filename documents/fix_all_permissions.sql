-- 🛠️ MASTER PERMISSION FIX SCRIPT
-- Run this script whenever you encounter "Permission Denied" or "RLS" errors.
-- It will safely reset and re-apply permissions for ALL tables without deleting your data.

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
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.influencer_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Influencer details viewable by everyone" ON influencer_details;
DROP POLICY IF EXISTS "Influencers can update own details" ON influencer_details;
DROP POLICY IF EXISTS "Influencers can insert own details" ON influencer_details;

CREATE POLICY "Influencer details viewable by everyone" ON influencer_details FOR SELECT USING ( true );
CREATE POLICY "Influencers can update own details" ON influencer_details FOR UPDATE USING ( auth.uid() = id );
CREATE POLICY "Influencers can insert own details" ON influencer_details FOR INSERT WITH CHECK ( auth.uid() = id );

-- ==========================================
-- 3. BRAND PRODUCTS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.brand_products (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  brand_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  image_url text,
  price integer,
  category text,
  selling_points text,
  required_shots text,
  website_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.brand_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Brand products are viewable by everyone" ON brand_products;
DROP POLICY IF EXISTS "Brands can insert their own products" ON brand_products;
DROP POLICY IF EXISTS "Brands can update their own products" ON brand_products;
DROP POLICY IF EXISTS "Brands can delete their own products" ON brand_products;

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
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY; -- Creator applies to campaign
ALTER TABLE public.brand_proposals ENABLE ROW LEVEL SECURITY; -- Brand offers to creator

-- Reset Policies
DROP POLICY IF EXISTS "Campaigns viewable by everyone" ON campaigns;
DROP POLICY IF EXISTS "Brands can manage campaigns" ON campaigns;
DROP POLICY IF EXISTS "Proposals viewable by involved parties" ON proposals;
DROP POLICY IF EXISTS "Creators can create proposals" ON proposals;

DROP POLICY IF EXISTS "Brand proposals viewable by everyone" ON brand_proposals;
DROP POLICY IF EXISTS "Brand proposals viewable by sender and receiver" ON brand_proposals;
DROP POLICY IF EXISTS "Brands can create proposals" ON brand_proposals;
DROP POLICY IF EXISTS "Receiver can update status" ON brand_proposals;

-- Re-apply Campaigns
CREATE POLICY "Campaigns viewable by everyone" ON campaigns FOR SELECT USING (true);
CREATE POLICY "Brands can manage campaigns" ON campaigns FOR ALL USING (auth.uid() = brand_id);

-- Re-apply Brand Proposals
CREATE POLICY "Brand proposals viewable by sender and receiver" ON brand_proposals FOR SELECT USING ( auth.uid() = brand_id OR auth.uid() = influencer_id );
CREATE POLICY "Brands can create proposals" ON brand_proposals FOR INSERT WITH CHECK ( auth.uid() = brand_id );
-- Allow both parties to update (e.g. Creator accepts, Brand cancels)
CREATE POLICY "Parties can update status" ON brand_proposals FOR UPDATE USING ( auth.uid() = brand_id OR auth.uid() = influencer_id );
CREATE POLICY "Brands can delete proposals" ON brand_proposals FOR DELETE USING ( auth.uid() = brand_id );

-- ==========================================
-- 6. MESSAGES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  proposal_id uuid REFERENCES public.brand_proposals(id) ON DELETE SET NULL, -- Optional link
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
-- 7. GRANT PERMISSIONS
-- ==========================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

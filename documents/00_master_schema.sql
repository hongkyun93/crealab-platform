-- 👑 MASTER SCHEMA V1.0 (Consolidated)
-- Run this script to Initialize OR Update the database state.
-- It is designed to be IDEMPOTENT (safe to run multiple times).

-- ==========================================
-- 1. EXTENSIONS & TYPES
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('brand', 'influencer', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- 2. TABLES & COLUMNS (Structure)
-- ==========================================

-- 2.1 PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email text,
  role user_role DEFAULT 'influencer',
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- Add missing columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_mock BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now());

-- 2.2 INFLUENCER DETAILS
CREATE TABLE IF NOT EXISTS public.influencer_details (
  id uuid REFERENCES public.profiles(id) PRIMARY KEY,
  instagram_handle text,
  followers_count integer,
  tier text,
  tags text[],
  price_video integer, -- Short-form video price
  price_feed integer, -- Feed post price
  secondary_rights boolean DEFAULT false, -- Secondary usage rights availability
  usage_rights_month integer, -- 2nd usage rights duration (months)
  usage_rights_price integer, -- 2nd usage rights price
  auto_dm_month integer, -- Auto DM duration (months)
  auto_dm_price integer, -- Auto DM price
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add missing columns for Rate Card
ALTER TABLE public.influencer_details ADD COLUMN IF NOT EXISTS price_video integer;
ALTER TABLE public.influencer_details ADD COLUMN IF NOT EXISTS price_feed integer;
ALTER TABLE public.influencer_details ADD COLUMN IF NOT EXISTS secondary_rights boolean DEFAULT false;
ALTER TABLE public.influencer_details ADD COLUMN IF NOT EXISTS usage_rights_month integer;
ALTER TABLE public.influencer_details ADD COLUMN IF NOT EXISTS usage_rights_price integer;
ALTER TABLE public.influencer_details ADD COLUMN IF NOT EXISTS auto_dm_month integer;
ALTER TABLE public.influencer_details ADD COLUMN IF NOT EXISTS auto_dm_price integer;

-- 2.3 LIFE MOMENTS
CREATE TABLE IF NOT EXISTS public.life_moments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  icon text,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- Seed Life Moments (Idempotent)
INSERT INTO life_moments (name, icon, description) VALUES
  ('이사/자취', '🏠', '자취 시작, 이사 준비, 인테리어'),
  ('결혼/웨딩', '💍', '결혼 준비, 프로포즈, 신혼'),
  ('출산/육아', '👶', '임신, 출산, 육아용품'),
  ('반려동물', '🐶', '반려견/묘 입양, 펫케어'),
  ('여행/레저', '✈️', '해외여행, 캠핑, 호캉스'),
  ('취업/이직', '💼', '면접, 출근룩, 데스크테리어'),
  ('운동/다이어트', '💪', '바디프로필, 식단관리'),
  ('입학/졸업', '🎓', '입학선물, 졸업식')
ON CONFLICT DO NOTHING; -- Skip if exists (assuming name constraint or just simplistic)

-- 2.4 BRAND PRODUCTS
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
  content_guide text,
  format_guide text,
  tags text[],
  account_tag text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
-- Add missing columns to brand_products (Safety measure for existing tables)
ALTER TABLE public.brand_products ADD COLUMN IF NOT EXISTS selling_points text;
ALTER TABLE public.brand_products ADD COLUMN IF NOT EXISTS required_shots text;
ALTER TABLE public.brand_products ADD COLUMN IF NOT EXISTS website_url text;
ALTER TABLE public.brand_products ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.brand_products ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.brand_products ADD COLUMN IF NOT EXISTS price integer DEFAULT 0;
ALTER TABLE public.brand_products ADD COLUMN IF NOT EXISTS is_mock BOOLEAN DEFAULT FALSE;
ALTER TABLE public.brand_products ADD COLUMN IF NOT EXISTS content_guide text;
ALTER TABLE public.brand_products ADD COLUMN IF NOT EXISTS format_guide text;
ALTER TABLE public.brand_products ADD COLUMN IF NOT EXISTS tags text[];
ALTER TABLE public.brand_products ADD COLUMN IF NOT EXISTS account_tag text;

-- 2.5 CAMPAIGNS
CREATE TABLE IF NOT EXISTS public.campaigns (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  brand_id uuid REFERENCES public.profiles(id) NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  product_name text NOT NULL,
  product_image_url text,
  budget_min integer,
  budget_max integer,
  target_moment_id uuid REFERENCES public.life_moments(id),
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- Add missing columnsa
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS event_date text;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS posting_date text;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS budget text;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS target text;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS tags text[];

-- 2.6 INFLUENCER EVENTS (MOMENTS)
CREATE TABLE IF NOT EXISTS public.influencer_events (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  influencer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  target_product text,
  event_date text,
  posting_date text,
  category text,
  tags text[],
  is_verified boolean DEFAULT false,
  status text DEFAULT 'recruiting',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- Add missing columns
ALTER TABLE public.influencer_events ADD COLUMN IF NOT EXISTS guide text;
ALTER TABLE public.influencer_events ADD COLUMN IF NOT EXISTS is_mock BOOLEAN DEFAULT FALSE;
ALTER TABLE public.influencer_events ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE;
ALTER TABLE public.influencer_events ADD COLUMN IF NOT EXISTS schedule JSONB DEFAULT '{}'::jsonb;

-- 2.7 BRAND PROPOSALS (Direct Offers)
CREATE TABLE IF NOT EXISTS public.brand_proposals (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  brand_id uuid REFERENCES public.profiles(id) NOT NULL,
  influencer_id uuid REFERENCES public.profiles(id) NOT NULL,
  product_name text NOT NULL,
  product_type text DEFAULT 'gift',
  compensation_amount text, 
  has_incentive boolean DEFAULT false,
  incentive_detail text,
  content_type text,
  message text,
  status text DEFAULT 'offered',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- Add missing columns

-- Add missing columns
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS is_mock BOOLEAN DEFAULT FALSE;
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS contract_content TEXT;
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS contract_status TEXT DEFAULT 'none';
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS brand_signature TEXT;
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS influencer_signature TEXT;
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS brand_signed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS influencer_signed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES public.brand_products(id);
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS product_url text; -- New
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES public.influencer_events(id) ON DELETE SET NULL;
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS shipping_name text;
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS shipping_phone text;
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS shipping_address text;
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS tracking_number text;
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS delivery_status text DEFAULT 'pending';
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS date_flexible boolean DEFAULT false;
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS desired_date date;
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS video_guide boolean DEFAULT false;

-- 2.8 PROPOSALS (Applications)
CREATE TABLE IF NOT EXISTS public.proposals (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id uuid REFERENCES public.campaigns(id) NOT NULL,
  influencer_id uuid REFERENCES public.profiles(id) NOT NULL,
  message text,
  price_offer integer,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- Add missing columns
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS contract_content TEXT;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS contract_status TEXT DEFAULT 'none';
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS brand_signature TEXT;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS influencer_signature TEXT;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS brand_signed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS influencer_signed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS shipping_name text;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS shipping_phone text;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS shipping_address text;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS tracking_number text;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS delivery_status text DEFAULT 'pending';

-- 2.9 MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  proposal_id uuid REFERENCES public.proposals(id) ON DELETE SET NULL, -- Link to Campaign Applications
  brand_proposal_id uuid REFERENCES public.brand_proposals(id) ON DELETE SET NULL, -- Link to Direct Offers
  sender_id uuid REFERENCES public.profiles(id) NOT NULL,
  receiver_id uuid REFERENCES public.profiles(id) NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  is_mock boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- Ensure columns exist (for migration safety)
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS brand_proposal_id uuid REFERENCES public.brand_proposals(id) ON DELETE SET NULL;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_mock BOOLEAN DEFAULT FALSE;
ALTER TABLE public.messages ALTER COLUMN proposal_id DROP NOT NULL; -- Ensure proposal_id is optional


-- 2.10 NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipient_id uuid REFERENCES public.profiles(id) NOT NULL,
  sender_id uuid REFERENCES public.profiles(id),
  type text NOT NULL, -- 'proposal_accepted', 'condition_confirmed', 'new_message', etc.
  content text NOT NULL,
  reference_id uuid, -- Link to proposal_id or brand_proposal_id
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 3. FUNCTIONS & TRIGGERS
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  preferred_role user_role;
BEGIN
  IF new.raw_user_meta_data->>'role_type' = 'brand' THEN
    preferred_role := 'brand';
  ELSE
    preferred_role := 'influencer';
  END IF;

  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 
    preferred_role
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name);
    
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ==========================================
-- 4. RLS POLICIES (Reset & Re-create)
-- ==========================================
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 4.1 Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING ( true );
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK ( auth.uid() = id );
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING ( auth.uid() = id );

-- 4.2 Influencer Details
DROP POLICY IF EXISTS "Influencer details viewable by everyone" ON influencer_details;
DROP POLICY IF EXISTS "Influencers can update own details" ON influencer_details;
DROP POLICY IF EXISTS "Influencers can insert own details" ON influencer_details;
CREATE POLICY "Influencer details viewable by everyone" ON influencer_details FOR SELECT USING ( true );
CREATE POLICY "Influencers can update own details" ON influencer_details FOR UPDATE USING ( auth.uid() = id );
CREATE POLICY "Influencers can insert own details" ON influencer_details FOR INSERT WITH CHECK ( auth.uid() = id );

-- 4.3 Brand Products
DROP POLICY IF EXISTS "Brand products are viewable by everyone" ON brand_products;
DROP POLICY IF EXISTS "Brands can insert their own products" ON brand_products;
DROP POLICY IF EXISTS "Brands can update their own products" ON brand_products;
DROP POLICY IF EXISTS "Brands can delete their own products" ON brand_products;
CREATE POLICY "Brand products are viewable by everyone" ON brand_products FOR SELECT USING ( true );
CREATE POLICY "Brands can insert their own products" ON brand_products FOR INSERT WITH CHECK ( auth.uid() = brand_id );
CREATE POLICY "Brands can update their own products" ON brand_products FOR UPDATE USING ( auth.uid() = brand_id );
CREATE POLICY "Brands can delete their own products" ON brand_products FOR DELETE USING ( auth.uid() = brand_id );

-- 4.4 Influencer Events
DROP POLICY IF EXISTS "Influencer events are viewable by everyone" ON influencer_events;
DROP POLICY IF EXISTS "Influencers can insert their own events" ON influencer_events;
DROP POLICY IF EXISTS "Influencers can update their own events" ON influencer_events;
DROP POLICY IF EXISTS "Influencers can delete their own events" ON influencer_events;
CREATE POLICY "Influencer events are viewable by everyone" ON influencer_events FOR SELECT USING ( true );
CREATE POLICY "Influencers can insert their own events" ON influencer_events FOR INSERT WITH CHECK ( auth.uid() = influencer_id );
CREATE POLICY "Influencers can update their own events" ON influencer_events FOR UPDATE USING ( auth.uid() = influencer_id );
CREATE POLICY "Influencers can delete their own events" ON influencer_events FOR DELETE USING ( auth.uid() = influencer_id );

-- 4.5 Campaigns
DROP POLICY IF EXISTS "Campaigns viewable by everyone" ON campaigns;
DROP POLICY IF EXISTS "Brands can manage campaigns" ON campaigns;
CREATE POLICY "Campaigns viewable by everyone" ON campaigns FOR SELECT USING (true);
CREATE POLICY "Brands can manage campaigns" ON campaigns FOR ALL USING (auth.uid() = brand_id);

-- 4.6 Brand Proposals
DROP POLICY IF EXISTS "Brand proposals viewable by sender and receiver" ON brand_proposals;
DROP POLICY IF EXISTS "Brands can create proposals" ON brand_proposals;
DROP POLICY IF EXISTS "Parties can update status" ON brand_proposals;
DROP POLICY IF EXISTS "Brands can delete proposals" ON brand_proposals;
CREATE POLICY "Brand proposals viewable by sender and receiver" ON brand_proposals FOR SELECT USING ( auth.uid() = brand_id OR auth.uid() = influencer_id );
CREATE POLICY "Brands can create proposals" ON brand_proposals FOR INSERT WITH CHECK ( auth.uid() = brand_id );
CREATE POLICY "Parties can update status" ON brand_proposals FOR UPDATE USING ( auth.uid() = brand_id OR auth.uid() = influencer_id );
CREATE POLICY "Brands can delete proposals" ON brand_proposals FOR DELETE USING ( auth.uid() = brand_id );

-- 4.7 Proposals (Campaign Applications)
DROP POLICY IF EXISTS "Proposals viewable by parties" ON proposals;
DROP POLICY IF EXISTS "Influencers can create proposals" ON proposals;
DROP POLICY IF EXISTS "Parties can update proposals" ON proposals;
CREATE POLICY "Proposals viewable by parties" ON proposals FOR SELECT USING ( auth.uid() = influencer_id OR EXISTS ( SELECT 1 FROM campaigns WHERE campaigns.id = proposals.campaign_id AND campaigns.brand_id = auth.uid() ) );
CREATE POLICY "Influencers can create proposals" ON proposals FOR INSERT WITH CHECK ( auth.uid() = influencer_id );
CREATE POLICY "Parties can update proposals" ON proposals FOR UPDATE USING ( auth.uid() = influencer_id OR EXISTS ( SELECT 1 FROM campaigns WHERE campaigns.id = proposals.campaign_id AND campaigns.brand_id = auth.uid() ) );

-- 4.8 Messages
DROP POLICY IF EXISTS "Messages viewable by sender and receiver" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update messages" ON messages;
CREATE POLICY "Messages viewable by sender and receiver" ON messages FOR SELECT USING ( auth.uid() = sender_id OR auth.uid() = receiver_id );
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK ( auth.uid() = sender_id );
CREATE POLICY "Users can update messages" ON messages FOR UPDATE USING ( auth.uid() = sender_id OR auth.uid() = receiver_id );

-- 4.9 Notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING ( auth.uid() = recipient_id );
CREATE POLICY "Users can insert notifications" ON notifications FOR INSERT WITH CHECK ( true ); -- Allow sending to others
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING ( auth.uid() = recipient_id );


-- ==========================================
-- 5. STORAGE BUCKETS
-- ==========================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('submissions', 'submissions', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Reset Storage Policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;

-- Re-create Storage Policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public Access Submissions" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload submissions" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update submissions" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete submissions" ON storage.objects;

CREATE POLICY "Public Access Submissions" ON storage.objects FOR SELECT USING (bucket_id = 'submissions');
CREATE POLICY "Authenticated users can upload submissions" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'submissions' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update submissions" ON storage.objects FOR UPDATE USING (bucket_id = 'submissions' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete submissions" ON storage.objects FOR DELETE USING (bucket_id = 'submissions' AND auth.role() = 'authenticated');


-- ==========================================
-- 6. PERMISSIONS
-- ==========================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- DONE
-- Ensure brand_proposal_id exists (it was missing in some early schemas)
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS brand_proposal_id uuid REFERENCES public.brand_proposals(id) ON DELETE SET NULL;


-- ==========================================
-- 7. ADDITIONAL FIELDS (CONSOLIDATED)
-- ==========================================

-- 7.1 Delivery Fields (from add_delivery_fields.sql)
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

-- 7.2 Profile Contact Fields (from add_profile_contact_fields.sql)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website text;

-- 7.3 Content Submission Fields
-- For Direct Offers (Brand Proposals)
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS content_submission_url text; -- YouTube/SNS Link
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS content_submission_file_url text; -- Direct File Upload
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS content_submission_status text DEFAULT 'pending'; -- pending, submitted, approved, rejected
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS content_submission_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS content_submission_version NUMERIC(3,1) DEFAULT 1.0;

-- For Campaign Applications (Proposals)
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS content_submission_url text;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS content_submission_file_url text;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS content_submission_status text DEFAULT 'pending';
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS content_submission_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS content_submission_version NUMERIC(3,1) DEFAULT 1.0;

-- 7.4 Mutual Condition Confirmation Fields (Added via Agent)
-- For Direct Offers
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS brand_condition_confirmed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS influencer_condition_confirmed BOOLEAN DEFAULT FALSE;

-- For Campaign Applications
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS brand_condition_confirmed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS influencer_condition_confirmed BOOLEAN DEFAULT FALSE;

-- Notify PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';

-- ==========================================
-- 8. REALTIME CONFIGURATION
-- ==========================================
-- Enable Supabase Realtime for core tables to ensure immediate UI updates.
-- Re-runnable (Idempotent)

DO $$
BEGIN
    -- Add tables to the supabase_realtime publication if not already present
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'influencer_events') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE influencer_events;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'campaigns') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE campaigns;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'proposals') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE proposals;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'brand_proposals') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE brand_proposals;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'brand_products') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE brand_products;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'messages') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE messages;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'profiles') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'notifications') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
    END IF;
END $$;

-- ==========================================
-- 9. STORAGE CONFIGURATION
-- ==========================================
-- Create 'product-images' bucket if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 52428800, ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp']) -- 50MB limit
ON CONFLICT (id) DO UPDATE SET public = true;

-- Enable RLS on storage.objects (if not already enabled)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY; -- Commented out to avoid ownership error (usually enabled by default)

-- Policy: Allow public read access to product images
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Read Access'
    ) THEN
        CREATE POLICY "Public Read Access"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'product-images');
    END IF;
END $$;

-- Policy: Allow authenticated users to upload product images
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated Upload'
    ) THEN
        CREATE POLICY "Authenticated Upload"
        ON storage.objects FOR INSERT
        WITH CHECK (
            bucket_id = 'product-images' 
            AND auth.role() = 'authenticated'
        );
    END IF;
END $$;

-- Policy: Allow users to update their own uploaded images (optional, based on owner)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Owner Update'
    ) THEN
        CREATE POLICY "Owner Update"
        ON storage.objects FOR UPDATE
        USING (
            bucket_id = 'product-images' 
            AND auth.uid() = owner
        );
    END IF;
END $$;

-- Policy: Allow users to delete their own uploaded images
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Owner Delete'
    ) THEN
        CREATE POLICY "Owner Delete"
        ON storage.objects FOR DELETE
        USING (
            bucket_id = 'product-images' 
            AND auth.uid() = owner
        );
    END IF;
END $$;

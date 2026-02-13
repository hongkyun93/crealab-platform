-- 👑 MASTER SCHEMA V2.1 (Consolidated & Robust)
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
  handle text,
  avatar_url text,
  bio text,
  website text,
  phone text,
  address text,
  is_mock boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- Add missing columns to profiles (Safety Checks)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS handle text;
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
-- Add missing columns
ALTER TABLE public.influencer_details ADD COLUMN IF NOT EXISTS price_video integer;
ALTER TABLE public.influencer_details ADD COLUMN IF NOT EXISTS price_feed integer;
ALTER TABLE public.influencer_details ADD COLUMN IF NOT EXISTS secondary_rights boolean DEFAULT false;
ALTER TABLE public.influencer_details ADD COLUMN IF NOT EXISTS usage_rights_month integer;
ALTER TABLE public.influencer_details ADD COLUMN IF NOT EXISTS usage_rights_price integer;
ALTER TABLE public.influencer_details ADD COLUMN IF NOT EXISTS auto_dm_month integer;
ALTER TABLE public.influencer_details ADD COLUMN IF NOT EXISTS auto_dm_price integer;

-- 2.2a INSTAGRAM ACCOUNTS
CREATE TABLE IF NOT EXISTS public.instagram_accounts (
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    instagram_user_id text,
    access_token text,
    page_id text,
    username text,
    profile_picture_url text,
    follower_count integer,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 2.3 LIFE MOMENTS (Influencer Events)
CREATE TABLE IF NOT EXISTS public.life_moments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text,
  icon text,
  description text,
  influencer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text,
  target_product text,
  event_date text,
  posting_date text,
  category text,
  tags text[],
  is_verified boolean DEFAULT false,
  status text DEFAULT 'recruiting',
  is_mock BOOLEAN DEFAULT FALSE,
  is_private BOOLEAN DEFAULT FALSE,
  schedule JSONB DEFAULT '{}'::jsonb,
  guide text,
  price_video integer,
  date_flexible BOOLEAN DEFAULT FALSE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- Force add columns
ALTER TABLE public.life_moments ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.life_moments ADD COLUMN IF NOT EXISTS icon text;
ALTER TABLE public.life_moments ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.life_moments ADD COLUMN IF NOT EXISTS influencer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.life_moments ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE public.life_moments ADD COLUMN IF NOT EXISTS target_product text;
ALTER TABLE public.life_moments ADD COLUMN IF NOT EXISTS event_date text;
ALTER TABLE public.life_moments ADD COLUMN IF NOT EXISTS posting_date text;
ALTER TABLE public.life_moments ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.life_moments ADD COLUMN IF NOT EXISTS tags text[];
ALTER TABLE public.life_moments ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
ALTER TABLE public.life_moments ADD COLUMN IF NOT EXISTS status text DEFAULT 'recruiting';
ALTER TABLE public.life_moments ADD COLUMN IF NOT EXISTS is_mock BOOLEAN DEFAULT FALSE;
ALTER TABLE public.life_moments ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE;
ALTER TABLE public.life_moments ADD COLUMN IF NOT EXISTS schedule JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.life_moments ADD COLUMN IF NOT EXISTS guide text;
ALTER TABLE public.life_moments ADD COLUMN IF NOT EXISTS price_video integer;
ALTER TABLE public.life_moments ADD COLUMN IF NOT EXISTS date_flexible BOOLEAN DEFAULT FALSE;

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
  is_mock BOOLEAN DEFAULT FALSE,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
-- Force add columns
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
  image text,
  budget_min integer,
  budget_max integer,
  target_moment_id uuid REFERENCES public.life_moments(id),
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS event_date text;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS posting_date text;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS budget text;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS target text;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS tags text[];
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS image text;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS recruitment_count integer;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS recruitment_deadline text;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS channels text[];
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS reference_link text;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS hashtags text[];
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS selection_announcement_date text;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS min_followers integer;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS max_followers integer;



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
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_mock boolean DEFAULT false,
  contract_content text,
  contract_status text DEFAULT 'none',
  brand_signature text,
  influencer_signature text,
  brand_signed_at timestamp with time zone,
  influencer_signed_at timestamp with time zone,
  product_id uuid REFERENCES public.brand_products(id),
  product_url text,
  event_id uuid REFERENCES public.life_moments(id) ON DELETE SET NULL,
  shipping_name text,
  shipping_phone text,
  shipping_address text,
  tracking_number text,
  delivery_status text DEFAULT 'pending',
  date_flexible boolean DEFAULT false,
  desired_date date,
  video_guide text DEFAULT 'brand_provided',
  
  -- Condition fields
  condition_product_receipt_date text,
  condition_plan_sharing_date text,
  condition_draft_submission_date text,
  condition_final_submission_date text,
  condition_upload_date text,
  condition_maintenance_period text,
  condition_secondary_usage_period text,
  brand_condition_confirmed BOOLEAN DEFAULT FALSE,
  influencer_condition_confirmed BOOLEAN DEFAULT FALSE,

  -- Content Submission
  content_submission_url text,
  content_submission_file_url text,
  content_submission_status text DEFAULT 'pending',
  content_submission_date TIMESTAMP WITH TIME ZONE,
  content_submission_version NUMERIC(3,1) DEFAULT 1.0,

  content_submission_url_2 text,
  content_submission_file_url_2 text,
  content_submission_status_2 text DEFAULT 'pending',
  content_submission_date_2 TIMESTAMP WITH TIME ZONE,
  content_submission_version_2 NUMERIC(3,1) DEFAULT 0.9,
  
  -- Application Fields (Added for Campaign-style applications on Products)
  motivation text,
  content_plan text,
  portfolio_links text[],
  instagram_handle text,
  insight_screenshot text
);

-- Force add columns for brand_proposals (Update Safety)
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS motivation text;
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS content_plan text;
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS portfolio_links text[];
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS instagram_handle text;
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS insight_screenshot text;

-- 2.8 CAMPAIGN PROPOSALS (Applications)
CREATE TABLE IF NOT EXISTS public.campaign_proposals (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id uuid REFERENCES public.campaigns(id) NOT NULL,
  influencer_id uuid REFERENCES public.profiles(id) NOT NULL,
  message text,
  price_offer integer,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  contract_content TEXT,
  contract_status TEXT DEFAULT 'none',
  brand_signature TEXT,
  influencer_signature TEXT,
  brand_signed_at TIMESTAMP WITH TIME ZONE,
  influencer_signed_at TIMESTAMP WITH TIME ZONE,
  
  shipping_name text,
  shipping_phone text,
  shipping_address text,
  tracking_number text,
  delivery_status text DEFAULT 'pending',
  
  motivation text,
  content_plan text,
  portfolio_links text[],
  instagram_handle text,
  insight_screenshot text,

  -- Condition fields
  condition_product_receipt_date text,
  condition_plan_sharing_date text,
  condition_draft_submission_date text,
  condition_final_submission_date text,
  condition_upload_date text,
  condition_maintenance_period text,
  condition_secondary_usage_period text,
  brand_condition_confirmed BOOLEAN DEFAULT FALSE,
  influencer_condition_confirmed BOOLEAN DEFAULT FALSE,

  -- Content Submission
  content_submission_url text,
  content_submission_file_url text,
  content_submission_status text DEFAULT 'pending',
  content_submission_date TIMESTAMP WITH TIME ZONE,
  content_submission_version NUMERIC(3,1) DEFAULT 1.0,

  content_submission_url_2 text,
  content_submission_file_url_2 text,
  content_submission_status_2 text DEFAULT 'pending',
  content_submission_date_2 TIMESTAMP WITH TIME ZONE,
  content_submission_version_2 NUMERIC(3,1) DEFAULT 0.9
);



-- 2.8a MOMENT PROPOSALS (New)
CREATE TABLE IF NOT EXISTS public.moment_proposals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Relationships
    brand_id UUID REFERENCES public.profiles(id) NOT NULL,
    influencer_id UUID REFERENCES public.profiles(id) NOT NULL,
    moment_id UUID REFERENCES public.life_moments(id) NOT NULL, -- Replaces event_id
    product_id UUID REFERENCES public.brand_products(id), -- Optional product link
    product_url TEXT,

    -- Proposal Data (Copied from brand_proposals)
    product_name TEXT NOT NULL,
    product_type TEXT DEFAULT 'gift',
    compensation_amount TEXT, 
    has_incentive BOOLEAN DEFAULT FALSE,
    incentive_detail TEXT,
    content_type TEXT,
    message TEXT,
    status TEXT DEFAULT 'offered' CHECK (status IN ('offered', 'negotiating', 'accepted', 'rejected', 'completed', 'cancelled')),
    
    is_mock BOOLEAN DEFAULT FALSE,
    contract_content TEXT,
    contract_status TEXT DEFAULT 'none',
    brand_signature TEXT,
    influencer_signature TEXT,
    brand_signed_at TIMESTAMP WITH TIME ZONE,
    influencer_signed_at TIMESTAMP WITH TIME ZONE,
    
    shipping_name TEXT,
    shipping_phone TEXT,
    shipping_address TEXT,
    tracking_number TEXT,
    delivery_status TEXT DEFAULT 'pending',
    
    date_flexible BOOLEAN DEFAULT FALSE,
    desired_date DATE,
    video_guide TEXT DEFAULT 'brand_provided',

    -- Condition Fields
    condition_product_receipt_date TEXT,
    condition_plan_sharing_date TEXT,
    condition_draft_submission_date TEXT,
    condition_final_submission_date TEXT,
    condition_upload_date TEXT,
    condition_maintenance_period TEXT,
    condition_secondary_usage_period TEXT,
    brand_condition_confirmed BOOLEAN DEFAULT FALSE,
    influencer_condition_confirmed BOOLEAN DEFAULT FALSE,

    -- Content Submission
    content_submission_url TEXT,
    content_submission_file_url TEXT,
    content_submission_status TEXT DEFAULT 'pending',
    content_submission_date TIMESTAMP WITH TIME ZONE,
    content_submission_version NUMERIC(3,1) DEFAULT 1.0,

    content_submission_url_2 TEXT,
    content_submission_file_url_2 TEXT,
    content_submission_status_2 TEXT DEFAULT 'pending',
    content_submission_date_2 TIMESTAMP WITH TIME ZONE,
    content_submission_version_2 NUMERIC(3,1) DEFAULT 0.9,
    
    -- Application Fields (If applicable, good to have for symmetry)
    motivation TEXT,
    content_plan TEXT,
    portfolio_links TEXT[],
    instagram_handle TEXT,
    insight_screenshot TEXT,

    price_offer BIGINT, -- Legacy/Specific to moment? Keep for safety
    conditions JSONB DEFAULT '{}'::jsonb -- Legacy/Specific to moment? Keep for backwards compat
);

-- 2.9 MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  proposal_id uuid REFERENCES public.campaign_proposals(id) ON DELETE SET NULL,
  brand_proposal_id uuid REFERENCES public.brand_proposals(id) ON DELETE SET NULL,
  sender_id uuid REFERENCES public.profiles(id) NOT NULL,
  receiver_id uuid REFERENCES public.profiles(id) NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  is_mock boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.10 NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipient_id uuid REFERENCES public.profiles(id) NOT NULL,
  sender_id uuid REFERENCES public.profiles(id),
  type text NOT NULL,
  content text NOT NULL,
  reference_id uuid,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.11 SUBMISSION FEEDBACK
CREATE TABLE IF NOT EXISTS public.submission_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID REFERENCES public.campaign_proposals(id) ON DELETE CASCADE,
    brand_proposal_id UUID REFERENCES public.brand_proposals(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT feedback_target_check CHECK (
        (proposal_id IS NOT NULL AND brand_proposal_id IS NULL) OR
        (proposal_id IS NULL AND brand_proposal_id IS NOT NULL)
    )
);

-- 2.12 FAVORITES
CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  target_id uuid NOT NULL,
  target_type text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, target_id, target_type)
);

-- ==========================================
-- 3. DATA MIGRATION & FIXES (CRITICAL)
-- ==========================================

-- 3.1 Restore Foreign Keys
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'brand_products_brand_id_fkey') THEN
        ALTER TABLE public.brand_products ADD CONSTRAINT brand_products_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'life_moments_influencer_id_fkey') THEN
        ALTER TABLE public.life_moments ADD CONSTRAINT life_moments_influencer_id_fkey FOREIGN KEY (influencer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'messages_brand_proposal_id_fkey') THEN
         ALTER TABLE public.messages ADD CONSTRAINT messages_brand_proposal_id_fkey FOREIGN KEY (brand_proposal_id) REFERENCES public.brand_proposals(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3.2 Migrate boolean 'video_guide' to text (Safety)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brand_proposals' AND column_name = 'video_guide' AND data_type = 'boolean') THEN
        ALTER TABLE public.brand_proposals RENAME COLUMN video_guide TO video_guide_old;
        ALTER TABLE public.brand_proposals ADD COLUMN video_guide text NOT NULL DEFAULT 'brand_provided';
        UPDATE public.brand_proposals SET video_guide = CASE WHEN video_guide_old = true THEN 'brand_provided' ELSE 'creator_planned' END;
        ALTER TABLE public.brand_proposals DROP COLUMN video_guide_old;
    END IF;
END $$;

-- 3.3 Create Indexes
CREATE INDEX IF NOT EXISTS idx_brand_proposals_contract_status ON brand_proposals(contract_status);
CREATE INDEX IF NOT EXISTS idx_campaign_proposals_contract_status ON campaign_proposals(contract_status);


-- ==========================================
-- 4. FUNCTIONS & TRIGGERS
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
-- 5. RLS POLICIES (Reset & Re-create)
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- 5.1.1 Campaigns (Public Read, Brand Write)
DO $$ BEGIN
    DROP POLICY IF EXISTS "Campaigns are viewable by everyone" ON campaigns;
    DROP POLICY IF EXISTS "Brands can insert campaigns" ON campaigns;
    DROP POLICY IF EXISTS "Brands can update campaigns" ON campaigns;
    DROP POLICY IF EXISTS "Brands can delete campaigns" ON campaigns;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "Campaigns are viewable by everyone" ON campaigns FOR SELECT USING ( true );
CREATE POLICY "Brands can insert campaigns" ON campaigns FOR INSERT WITH CHECK ( auth.uid() = brand_id );
CREATE POLICY "Brands can update campaigns" ON campaigns FOR UPDATE USING ( auth.uid() = brand_id );
CREATE POLICY "Brands can delete campaigns" ON campaigns FOR DELETE USING ( auth.uid() = brand_id );
ALTER TABLE public.campaign_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- 5.1 Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING ( true );
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK ( auth.uid() = id );
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING ( auth.uid() = id );

-- 5.2 Brand Products
DO $$ BEGIN
    DROP POLICY IF EXISTS "Brand products are viewable by everyone" ON brand_products;
    DROP POLICY IF EXISTS "Brands can insert their own products" ON brand_products;
    DROP POLICY IF EXISTS "Brands can update their own products" ON brand_products;
    DROP POLICY IF EXISTS "Brands can delete their own products" ON brand_products;
    DROP POLICY IF EXISTS "policy_select_products" ON brand_products;
    DROP POLICY IF EXISTS "policy_insert_products" ON brand_products;
    DROP POLICY IF EXISTS "policy_update_products" ON brand_products;
    DROP POLICY IF EXISTS "policy_delete_products" ON brand_products;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
CREATE POLICY "Brand products are viewable by everyone" ON brand_products FOR SELECT USING ( true );
CREATE POLICY "Brands can insert their own products" ON brand_products FOR INSERT WITH CHECK ( auth.uid() = brand_id );
CREATE POLICY "Brands can update their own products" ON brand_products FOR UPDATE USING ( auth.uid() = brand_id );
CREATE POLICY "Brands can delete their own products" ON brand_products FOR DELETE USING ( auth.uid() = brand_id );

-- 5.3 Brand Proposals (Missing Policies for Influencers)
DO $$ BEGIN
    DROP POLICY IF EXISTS "Brand proposals are viewable by participants" ON brand_proposals;
    DROP POLICY IF EXISTS "Brands can insert proposals" ON brand_proposals;
    DROP POLICY IF EXISTS "Influencers can insert proposals" ON brand_proposals; -- NEW
    DROP POLICY IF EXISTS "Participants can update proposals" ON brand_proposals;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "Brand proposals are viewable by participants" ON brand_proposals FOR SELECT USING ( auth.uid() = brand_id OR auth.uid() = influencer_id );
CREATE POLICY "Brands can insert proposals" ON brand_proposals FOR INSERT WITH CHECK ( auth.uid() = brand_id );
CREATE POLICY "Influencers can insert proposals" ON brand_proposals FOR INSERT WITH CHECK ( auth.uid() = influencer_id ); -- NEW: Allow creators to apply
CREATE POLICY "Participants can update proposals" ON brand_proposals FOR UPDATE USING ( auth.uid() = brand_id OR auth.uid() = influencer_id );

-- 5.4 Campaign Proposals (Applications) - NEW SECTION
DO $$ BEGIN
    DROP POLICY IF EXISTS "Campaign proposals are viewable by participants" ON campaign_proposals;
    DROP POLICY IF EXISTS "Influencers can insert campaign proposals" ON campaign_proposals;
    DROP POLICY IF EXISTS "Participants can update campaign proposals" ON campaign_proposals;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "Campaign proposals are viewable by participants" ON campaign_proposals FOR SELECT USING (
    auth.uid() = influencer_id OR
    EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_proposals.campaign_id AND c.brand_id = auth.uid())
);

CREATE POLICY "Influencers can insert campaign proposals" ON campaign_proposals FOR INSERT WITH CHECK (
    auth.uid() = influencer_id
);

CREATE POLICY "Participants can update campaign proposals" ON campaign_proposals FOR UPDATE USING (
    auth.uid() = influencer_id OR
    EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_proposals.campaign_id AND c.brand_id = auth.uid())
);

-- 5.4a Moment Proposals
DO $$ BEGIN
    DROP POLICY IF EXISTS "Moment proposals are viewable by involved parties" ON moment_proposals;
    DROP POLICY IF EXISTS "Brands can insert moment proposals" ON moment_proposals;
    DROP POLICY IF EXISTS "Involved parties can update status" ON moment_proposals;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

ALTER TABLE public.moment_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Moment proposals are viewable by involved parties" 
ON public.moment_proposals FOR SELECT 
USING (auth.uid() = brand_id OR auth.uid() = influencer_id);

CREATE POLICY "Brands can insert moment proposals" 
ON public.moment_proposals FOR INSERT 
WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "Involved parties can update status" 
ON public.moment_proposals FOR UPDATE 
USING (auth.uid() = brand_id OR auth.uid() = influencer_id);

DROP POLICY IF EXISTS "Users can delete their own moment proposals" ON moment_proposals;
CREATE POLICY "Users can delete their own moment proposals" 
ON public.moment_proposals FOR DELETE 
USING (auth.uid() = brand_id OR auth.uid() = influencer_id);

-- 5.3 Life Moments
DO $$ BEGIN
    DROP POLICY IF EXISTS "Life moments are viewable by everyone" ON life_moments;
    DROP POLICY IF EXISTS "Influencers can insert their own moments" ON life_moments;
    DROP POLICY IF EXISTS "Influencers can update their own moments" ON life_moments;
    DROP POLICY IF EXISTS "Influencers can delete their own moments" ON life_moments;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
CREATE POLICY "Life moments are viewable by everyone" ON life_moments FOR SELECT USING ( is_private = false OR auth.uid() = influencer_id );
CREATE POLICY "Influencers can insert their own moments" ON life_moments FOR INSERT WITH CHECK ( auth.uid() = influencer_id );
CREATE POLICY "Influencers can update their own moments" ON life_moments FOR UPDATE USING ( auth.uid() = influencer_id );
CREATE POLICY "Influencers can delete their own moments" ON life_moments FOR DELETE USING ( auth.uid() = influencer_id );

-- 5.3a Instagram Accounts
ALTER TABLE public.instagram_accounts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view own instagram account" ON instagram_accounts;
    DROP POLICY IF EXISTS "Users can insert own instagram account" ON instagram_accounts;
    DROP POLICY IF EXISTS "Users can update own instagram account" ON instagram_accounts;
    DROP POLICY IF EXISTS "Users can delete own instagram account" ON instagram_accounts;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "Users can view own instagram account" ON instagram_accounts FOR SELECT USING ( auth.uid() = user_id );
CREATE POLICY "Users can insert own instagram account" ON instagram_accounts FOR INSERT WITH CHECK ( auth.uid() = user_id );
CREATE POLICY "Users can update own instagram account" ON instagram_accounts FOR UPDATE USING ( auth.uid() = user_id );
CREATE POLICY "Users can delete own instagram account" ON instagram_accounts FOR DELETE USING ( auth.uid() = user_id );


-- 5.4 Messages
DROP POLICY IF EXISTS "Messages viewable by sender and receiver" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update messages" ON messages;
CREATE POLICY "Messages viewable by sender and receiver" ON messages FOR SELECT USING ( auth.uid() = sender_id OR auth.uid() = receiver_id );
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK ( auth.uid() = sender_id );
CREATE POLICY "Users can update messages" ON messages FOR UPDATE USING ( auth.uid() = sender_id OR auth.uid() = receiver_id );

-- 5.5 Notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING ( auth.uid() = recipient_id );
CREATE POLICY "Users can insert notifications" ON notifications FOR INSERT WITH CHECK ( true );
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING ( auth.uid() = recipient_id );

-- 5.6 Submission Feedback
DROP POLICY IF EXISTS "Users can view relevant feedback" ON submission_feedback;
DROP POLICY IF EXISTS "Users can insert relevant feedback" ON submission_feedback;
CREATE POLICY "Users can view relevant feedback" ON submission_feedback FOR SELECT USING (
    sender_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.campaign_proposals p WHERE p.id = proposal_id AND (p.influencer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = p.campaign_id AND c.brand_id = auth.uid()))) OR
    EXISTS (SELECT 1 FROM public.brand_proposals bp WHERE bp.id = brand_proposal_id AND (bp.influencer_id = auth.uid() OR bp.brand_id = auth.uid()))
);
CREATE POLICY "Users can insert relevant feedback" ON submission_feedback FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND (
        EXISTS (SELECT 1 FROM public.campaign_proposals p WHERE p.id = proposal_id AND (p.influencer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = p.campaign_id AND c.brand_id = auth.uid()))) OR
        EXISTS (SELECT 1 FROM public.brand_proposals bp WHERE bp.id = brand_proposal_id AND (bp.influencer_id = auth.uid() OR bp.brand_id = auth.uid()))
    )
);

-- ==========================================
-- 6. STORAGE BUCKETS & POLICIES
-- ==========================================
-- Buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public) VALUES ('campaigns', 'campaigns', true) ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public) VALUES ('submissions', 'submissions', true) ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO UPDATE SET public = true;

-- Generic Storage Policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public Access" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
    DROP POLICY IF EXISTS "Owner Update" ON storage.objects;
    DROP POLICY IF EXISTS "Owner Delete" ON storage.objects;
    
    -- Recreate for product-images (Primary Example)
    CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
    CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
    CREATE POLICY "Owner Update" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.uid() = owner);
    CREATE POLICY "Owner Delete" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.uid() = owner);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Policies for Campaigns
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public Access Campaigns" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated Users can Upload Campaigns" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated Users can Update Campaigns" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated Users can Delete Campaigns" ON storage.objects;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "Public Access Campaigns" ON storage.objects FOR SELECT USING (bucket_id = 'campaigns');
CREATE POLICY "Authenticated Users can Upload Campaigns" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'campaigns' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated Users can Update Campaigns" ON storage.objects FOR UPDATE USING (bucket_id = 'campaigns' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated Users can Delete Campaigns" ON storage.objects FOR DELETE USING (bucket_id = 'campaigns' AND auth.role() = 'authenticated');

-- ==========================================
-- 7. GRANT PERMISSIONS
-- ==========================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- Force Schema Cache Reload
NOTIFY pgrst, 'reload schema';

-- ==========================================
-- 8. NOTIFICATION TRIGGERS
-- ==========================================
-- Automatic notifications for key business events
-- Hybrid Approach: DB triggers for core events, client calls for complex interactions

-- 8.1 CAMPAIGN APPLICATION NOTIFICATION
CREATE OR REPLACE FUNCTION notify_brand_on_campaign_application()
RETURNS TRIGGER AS $$
DECLARE
    brand_user_id UUID;
    campaign_name TEXT;
    influencer_name TEXT;
BEGIN
    SELECT c.brand_id, c.product_name INTO brand_user_id, campaign_name
    FROM campaigns c WHERE c.id = NEW.campaign_id;
    
    SELECT display_name INTO influencer_name
    FROM profiles WHERE id = NEW.influencer_id;
    
    INSERT INTO notifications (recipient_id, sender_id, type, content, reference_id)
    VALUES (
        brand_user_id,
        NEW.influencer_id,
        'campaign_application',
        COALESCE(influencer_name, '크리에이터') || '님이 "' || COALESCE(campaign_name, '캠페인') || '" 캠페인에 지원했습니다.',
        NEW.id::text
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to create campaign application notification: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_campaign_application ON campaign_proposals;
CREATE TRIGGER on_campaign_application
AFTER INSERT ON campaign_proposals
FOR EACH ROW EXECUTE FUNCTION notify_brand_on_campaign_application();

-- 8.2 MOMENT PROPOSAL NOTIFICATION
CREATE OR REPLACE FUNCTION notify_influencer_on_moment_proposal()
RETURNS TRIGGER AS $$
DECLARE
    moment_title TEXT;
    brand_name TEXT;
BEGIN
    SELECT title INTO moment_title
    FROM life_moments WHERE id = NEW.moment_id;
    
    SELECT display_name INTO brand_name
    FROM profiles WHERE id = NEW.brand_id;
    
    INSERT INTO notifications (recipient_id, sender_id, type, content, reference_id)
    VALUES (
        NEW.influencer_id,
        NEW.brand_id,
        'moment_proposal',
        COALESCE(brand_name, '브랜드') || '님이 "' || COALESCE(moment_title, '모먼트') || '" 모먼트에 제안했습니다.',
        NEW.id::text
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to create moment proposal notification: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_moment_proposal ON moment_proposals;
CREATE TRIGGER on_moment_proposal
AFTER INSERT ON moment_proposals
FOR EACH ROW EXECUTE FUNCTION notify_influencer_on_moment_proposal();

-- 8.3 PRODUCT APPLICATION NOTIFICATION
CREATE OR REPLACE FUNCTION notify_brand_on_product_application()
RETURNS TRIGGER AS $$
DECLARE
    influencer_name TEXT;
BEGIN
    IF NEW.status IN ('applied', 'pending') THEN
        SELECT display_name INTO influencer_name
        FROM profiles WHERE id = NEW.influencer_id;
        
        INSERT INTO notifications (recipient_id, sender_id, type, content, reference_id)
        VALUES (
            NEW.brand_id,
            NEW.influencer_id,
            'product_application',
            COALESCE(influencer_name, '크리에이터') || '님이 "' || COALESCE(NEW.product_name, '제품') || '" 제품에 신청했습니다.',
            NEW.id::text
        );
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to create product application notification: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_product_application ON brand_proposals;
CREATE TRIGGER on_product_application
AFTER INSERT ON brand_proposals
FOR EACH ROW EXECUTE FUNCTION notify_brand_on_product_application();

-- 8.4 BRAND OFFER NOTIFICATION
CREATE OR REPLACE FUNCTION notify_influencer_on_brand_offer()
RETURNS TRIGGER AS $$
DECLARE
    brand_name TEXT;
BEGIN
    IF NEW.status = 'offered' THEN
        SELECT display_name INTO brand_name
        FROM profiles WHERE id = NEW.brand_id;
        
        INSERT INTO notifications (recipient_id, sender_id, type, content, reference_id)
        VALUES (
            NEW.influencer_id,
            NEW.brand_id,
            'brand_offer',
            COALESCE(brand_name, '브랜드') || '님이 "' || COALESCE(NEW.product_name, '제품') || '" 협업을 제안했습니다.',
            NEW.id::text
        );
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to create brand offer notification: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_brand_offer ON brand_proposals;
CREATE TRIGGER on_brand_offer
AFTER INSERT ON brand_proposals
FOR EACH ROW EXECUTE FUNCTION notify_influencer_on_brand_offer();

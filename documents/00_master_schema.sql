-- 👑 MASTER SCHEMA V3.0 (Refactored & Consolidated)
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
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  avatar_url text,
  user_type text DEFAULT 'influencer',
  role text, -- 'brand', 'creator', 'mcn', 'agency'
  phone text,
  instagram_handle text,
  description text,
  is_mock boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Merged from influencer_details
  followers_count integer DEFAULT 0,
  tier text,
  tags text[] DEFAULT '{}',
  price_video integer DEFAULT 0, -- Short-form video price
  price_feed integer DEFAULT 0, -- Feed post price
  secondary_rights boolean DEFAULT false, -- Secondary usage rights availability
  usage_rights_month integer DEFAULT 0, -- 2nd usage rights duration (months)
  usage_rights_price integer DEFAULT 0, -- 2nd usage rights price
  auto_dm_month integer DEFAULT 0, -- Auto DM duration (months)
  auto_dm_price integer DEFAULT 0 -- Auto DM price
);

-- Ensure user_type exists (for existing tables)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_type text DEFAULT 'influencer';

-- DEPRECATED: influencer_details (Merged into profiles)
-- CREATE TABLE IF NOT EXISTS public.influencer_details ...


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

-- 2.2b TEAMS
CREATE TABLE IF NOT EXISTS public.teams (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  website text,
  business_registration_number text,
  created_by uuid REFERENCES auth.users DEFAULT auth.uid(),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.2c TEAM MEMBERS
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);

-- Team Invitations
CREATE TABLE IF NOT EXISTS public.team_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    invited_by UUID REFERENCES public.profiles(id),
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
    UNIQUE(team_id, email)
);

CREATE INDEX IF NOT EXISTS idx_team_invitations_team_id ON public.team_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON public.team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_status ON public.team_invitations(status);

-- 2.3 LIFE MOMENTS (Influencer Events)
CREATE TABLE IF NOT EXISTS public.life_moments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  influencer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text,
  title text,
  icon text,
  description text,
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

-- 2.4 BRAND PRODUCTS
CREATE TABLE IF NOT EXISTS public.brand_products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  price integer DEFAULT 0,
  category text,
  image_url text,
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
  
  -- Additional Fields
  event_date text,
  posting_date text,
  category text,
  budget text,
  target text,
  tags text[],
  recruitment_count integer,
  recruitment_deadline text,
  channels text[],
  reference_link text,
  hashtags text[],
  selection_announcement_date text,
  min_followers integer,
  max_followers integer,
  
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.7 BRAND PROPOSALS (Direct Offers)
CREATE TABLE IF NOT EXISTS public.brand_proposals (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  brand_id uuid REFERENCES public.profiles(id) NOT NULL,
  influencer_id uuid REFERENCES public.profiles(id) NOT NULL,
  
  -- Product Info
  product_id uuid REFERENCES public.brand_products(id),
  product_name text NOT NULL,
  product_type text DEFAULT 'gift',
  product_url text,
  
  -- Offer Details
  price_offer BIGINT,
  compensation_amount text, 
  has_incentive boolean DEFAULT false,
  incentive_detail text,
  content_type text,
  message text,
  status text DEFAULT 'offered',
  
  -- Event Link
  event_id uuid REFERENCES public.life_moments(id) ON DELETE SET NULL,
  
  -- Logistics
  shipping_name text,
  shipping_phone text,
  shipping_address text,
  tracking_number text,
  delivery_status text DEFAULT 'pending',
  
  -- Schedule
  date_flexible boolean DEFAULT false,
  desired_date date,
  video_guide text DEFAULT 'brand_provided',
  
  -- Conditions
  condition_product_receipt_date text,
  condition_plan_sharing_date text,
  condition_draft_submission_date text,
  condition_final_submission_date text,
  condition_upload_date text,
  condition_maintenance_period text,
  condition_secondary_usage_period text,
  brand_condition_confirmed BOOLEAN DEFAULT FALSE,
  influencer_condition_confirmed BOOLEAN DEFAULT FALSE,
  special_terms text,
  
  -- Contract
  contract_content text,
  contract_status text DEFAULT 'none',
  brand_signature text,
  influencer_signature text,
  brand_signed_at timestamp with time zone,
  influencer_signed_at timestamp with time zone,
  
  -- Submission
  content_submission_url text,
  content_submission_file_url text,
  content_submission_status text DEFAULT 'pending',
  content_submission_date TIMESTAMP WITH TIME ZONE,
  content_submission_version NUMERIC(3,1) DEFAULT 1.0,
  content_submission_url_2 text,
  content_submission_file_url_2 text,
  content_submission_status_2 text DEFAULT 'pending',
  content_submission_date_2 TIMESTAMP WITH TIME ZONE,
  
  -- Meta
  is_mock boolean DEFAULT false,
  insight_screenshot text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.7.5 CAMPAIGN APPLICATIONS (Legacy/Active)
CREATE TABLE IF NOT EXISTS public.campaign_applications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id uuid REFERENCES public.campaigns(id) NOT NULL,
  influencer_id uuid REFERENCES public.profiles(id) NOT NULL,
  
  message text,
  price_offer integer,
  status text DEFAULT 'pending',
  
  motivation text,
  content_plan text,
  portfolio_links text[],
  instagram_handle text,
  insight_screenshot text,
  
  -- Logistics
  shipping_name text,
  shipping_phone text,
  shipping_address text,
  tracking_number text,
  delivery_status text DEFAULT 'pending',

  -- Contract
  contract_content TEXT,
  contract_status TEXT DEFAULT 'none',
  brand_signature TEXT,
  influencer_signature TEXT,
  brand_signed_at TIMESTAMP WITH TIME ZONE,
  influencer_signed_at TIMESTAMP WITH TIME ZONE,

  -- Conditions
  condition_product_receipt_date text,
  condition_plan_sharing_date text,
  condition_draft_submission_date text,
  condition_final_submission_date text,
  condition_upload_date text,
  condition_maintenance_period text,
  condition_secondary_usage_period text,
  brand_condition_confirmed BOOLEAN DEFAULT FALSE,
  influencer_condition_confirmed BOOLEAN DEFAULT FALSE,
  special_terms text,

  -- Submission
  content_submission_url text,
  content_submission_file_url text,
  content_submission_status text DEFAULT 'pending',
  content_submission_date TIMESTAMP WITH TIME ZONE,
  content_submission_version NUMERIC(3,1) DEFAULT 1.0,
  content_submission_url_2 text,
  content_submission_file_url_2 text,
  content_submission_status_2 text DEFAULT 'pending',
  content_submission_date_2 TIMESTAMP WITH TIME ZONE,
  
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.8 CAMPAIGN PROPOSALS (Applications)
CREATE TABLE IF NOT EXISTS public.campaign_proposals (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id uuid REFERENCES public.campaigns(id) NOT NULL,
  influencer_id uuid REFERENCES public.profiles(id) NOT NULL,
  
  message text,
  price_offer integer,
  status text DEFAULT 'pending',
  
  motivation text,
  content_plan text,
  portfolio_links text[],
  instagram_handle text,
  insight_screenshot text,
  
  -- Logistics
  shipping_name text,
  shipping_phone text,
  shipping_address text,
  tracking_number text,
  delivery_status text DEFAULT 'pending',

  -- Contract
  contract_content TEXT,
  contract_status TEXT DEFAULT 'none',
  brand_signature TEXT,
  influencer_signature TEXT,
  brand_signed_at TIMESTAMP WITH TIME ZONE,
  influencer_signed_at TIMESTAMP WITH TIME ZONE,

  -- Conditions
  condition_product_receipt_date text,
  condition_plan_sharing_date text,
  condition_draft_submission_date text,
  condition_final_submission_date text,
  condition_upload_date text,
  condition_maintenance_period text,
  condition_secondary_usage_period text,
  brand_condition_confirmed BOOLEAN DEFAULT FALSE,
  influencer_condition_confirmed BOOLEAN DEFAULT FALSE,
  special_terms text,

  -- Submission
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
  
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.8a MOMENT PROPOSALS (New)
CREATE TABLE IF NOT EXISTS public.moment_proposals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Relationships
    brand_id UUID REFERENCES public.profiles(id) NOT NULL,
    influencer_id UUID REFERENCES public.profiles(id) NOT NULL,
    moment_id UUID REFERENCES public.life_moments(id) NOT NULL, 
    product_id UUID REFERENCES public.brand_products(id),
    product_url TEXT,

    -- Proposal Data
    product_name TEXT NOT NULL,
    product_type TEXT DEFAULT 'gift',
    compensation_amount TEXT, 
    price_offer BIGINT,
    has_incentive BOOLEAN DEFAULT FALSE,
    incentive_detail TEXT,
    content_type TEXT,
    message TEXT,
    status TEXT DEFAULT 'offered' CHECK (status IN ('offered', 'negotiating', 'accepted', 'rejected', 'completed', 'cancelled')),
    
    -- Logistics
    shipping_name TEXT,
    shipping_phone TEXT,
    shipping_address TEXT,
    tracking_number TEXT,
    delivery_status TEXT DEFAULT 'pending',
    
    -- Schedule
    date_flexible BOOLEAN DEFAULT FALSE,
    desired_date DATE,
    video_guide TEXT DEFAULT 'brand_provided',

    -- Conditions
    condition_product_receipt_date TEXT,
    condition_plan_sharing_date TEXT,
    condition_draft_submission_date TEXT,
    condition_final_submission_date TEXT,
    condition_upload_date TEXT,
    condition_maintenance_period TEXT,
    condition_secondary_usage_period TEXT,
    brand_condition_confirmed BOOLEAN DEFAULT FALSE,
    influencer_condition_confirmed BOOLEAN DEFAULT FALSE,
    special_terms TEXT,
    conditions JSONB DEFAULT '{}'::jsonb, -- Legacy compat

    -- Contract
    contract_content TEXT,
    contract_status TEXT DEFAULT 'none',
    brand_signature TEXT,
    influencer_signature TEXT,
    brand_signed_at TIMESTAMP WITH TIME ZONE,
    influencer_signed_at TIMESTAMP WITH TIME ZONE,

    -- Submission
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
    
    -- Meta
    is_mock BOOLEAN DEFAULT FALSE,
    insight_screenshot TEXT,
    motivation TEXT,
    content_plan TEXT,
    portfolio_links TEXT[],
    instagram_handle TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
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
  target_type text NOT NULL, -- 'influencer', 'campaign', etc
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, target_id, target_type)
);

-- ==========================================
-- 3. FUNCTIONS & TRIGGERS
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, extensions
AS $$
DECLARE
  preferred_role text; -- Changed from user_role to text
  new_team_id uuid;
  base_slug text;
  final_slug text;
  counter int;
  user_name text;
BEGIN
  -- 1. Determine Role
  -- Check metadata 'role_type' or 'role' (fallback)
  IF new.raw_user_meta_data->>'role_type' = 'brand' OR new.raw_user_meta_data->>'role' = 'brand' THEN
    preferred_role := 'brand';
  ELSE
    preferred_role := 'influencer';
  END IF;

  -- 2. Determine Name
  user_name := COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
  IF user_name IS NULL OR user_name = '' THEN
      user_name := 'User';
  END IF;

  -- 3. Insert Profile
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    new.id, 
    new.email, 
    user_name, 
    preferred_role
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name);
    
  -- 4. Create Team (For everyone)
    
    -- Generate Slug
    base_slug := lower(regexp_replace(user_name, '[^a-zA-Z0-9]', '', 'g'));
    IF base_slug IS NULL OR base_slug = '' THEN base_slug := 'team'; END IF;
    
    final_slug := base_slug;
    counter := 1;
    
    -- Ensure unique slug
    WHILE EXISTS (SELECT 1 FROM public.teams WHERE slug = final_slug) LOOP
        final_slug := base_slug || counter;
        counter := counter + 1;
    END LOOP;

    -- Insert Team
    INSERT INTO public.teams (name, slug, logo_url)
    VALUES (
        user_name,
        final_slug,
        new.raw_user_meta_data->>'avatar_url'
    )
    RETURNING id INTO new_team_id;

    -- Insert Team Member (Owner)
    INSERT INTO public.team_members (team_id, user_id, role)
    VALUES (
        new_team_id,
        new.id,
        'owner'
    );

  RETURN new;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error (visible in Supabase logs) then raise
        RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
        RAISE; -- Re-raise to fail the transaction (signup failure is better than partial state)
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger for Manual Team Creation (auto-add owner)
CREATE OR REPLACE FUNCTION public.handle_new_team()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
      INSERT INTO public.team_members (team_id, user_id, role)
      VALUES (new.id, auth.uid(), 'owner')
      ON CONFLICT (team_id, user_id) DO NOTHING;
  END IF;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_team_created ON public.teams;
CREATE TRIGGER on_team_created
  AFTER INSERT ON public.teams
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_team();


-- ==========================================
-- 4. RLS POLICIES (Unified)
-- ==========================================
-- Enable RLS on All Tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moment_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_accounts ENABLE ROW LEVEL SECURITY;

-- 4.1a Teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's team IDs without RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_team_ids(target_user_id UUID)
RETURNS TABLE(team_id UUID)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT team_id FROM public.team_members WHERE user_id = target_user_id;
$$;

-- Helper function to check if user is owner/admin of a team (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.is_team_owner_or_admin(target_team_id UUID, target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.team_members 
    WHERE team_id = target_team_id 
    AND user_id = target_user_id 
    AND role IN ('owner', 'admin')
  );
$$;

DROP POLICY IF EXISTS "Members can view their teams" ON public.teams;
CREATE POLICY "Members can view their teams" ON public.teams
  FOR SELECT USING (
    id IN (SELECT public.get_user_team_ids(auth.uid()))
    OR
    created_by = auth.uid()
  );

DROP POLICY IF EXISTS "Authenticated users can create teams" ON public.teams;
CREATE POLICY "Authenticated users can create teams" ON public.teams 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Owners can update their teams" ON public.teams;
CREATE POLICY "Owners can update their teams" ON public.teams
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_id = teams.id 
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

DROP POLICY IF EXISTS "Members can view team members" ON public.team_members;
CREATE POLICY "Members can view team members" ON public.team_members
  FOR SELECT USING (
    -- Direct check: user can see team_members rows for teams they belong to
    team_id IN (SELECT public.get_user_team_ids(auth.uid()))
  );

DROP POLICY IF EXISTS "Owners and admins can add members" ON public.team_members;
CREATE POLICY "Owners and admins can add members" ON public.team_members
  FOR INSERT WITH CHECK (
    public.is_team_owner_or_admin(team_id, auth.uid())
  );

-- Team Invitations RLS
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members view team invitations" ON public.team_invitations;
CREATE POLICY "Members view team invitations" ON public.team_invitations
  FOR SELECT USING (
    team_id IN (SELECT public.get_user_team_ids(auth.uid()))
  );

DROP POLICY IF EXISTS "Managers create invitations" ON public.team_invitations;
CREATE POLICY "Managers create invitations" ON public.team_invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = team_invitations.team_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'manager')
    )
  );

DROP POLICY IF EXISTS "Managers update invitations" ON public.team_invitations;
CREATE POLICY "Managers update invitations" ON public.team_invitations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = team_invitations.team_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'manager')
    )
  );

DROP POLICY IF EXISTS "Managers delete invitations" ON public.team_invitations;
CREATE POLICY "Managers delete invitations" ON public.team_invitations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = team_invitations.team_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'manager')
    )
  );

DROP POLICY IF EXISTS "Public profiles" ON public.profiles;
CREATE POLICY "Public profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Self insert profiles" ON public.profiles;
CREATE POLICY "Self insert profiles" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Self update profiles" ON public.profiles;
CREATE POLICY "Self update profiles" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public influencer_details" ON public.influencer_details;
CREATE POLICY "Public influencer_details" ON public.influencer_details FOR SELECT USING (true);

DROP POLICY IF EXISTS "Self insert details" ON public.influencer_details;
CREATE POLICY "Self insert details" ON public.influencer_details FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Self update details" ON public.influencer_details;
CREATE POLICY "Self update details" ON public.influencer_details FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Self view instagram" ON public.instagram_accounts;
CREATE POLICY "Self view instagram" ON public.instagram_accounts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Self manage instagram" ON public.instagram_accounts;
CREATE POLICY "Self manage instagram" ON public.instagram_accounts FOR ALL USING (auth.uid() = user_id);

-- 4.2 Brand Products
DROP POLICY IF EXISTS "Public brand_products" ON public.brand_products;
CREATE POLICY "Public brand_products" ON public.brand_products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Brand manage products" ON public.brand_products;
CREATE POLICY "Brand manage products" ON public.brand_products FOR ALL USING (auth.uid() = brand_id);

-- 4.3 Life Moments
DROP POLICY IF EXISTS "Public life_moments" ON public.life_moments;
CREATE POLICY "Public life_moments" ON public.life_moments FOR SELECT USING (is_private = false OR auth.uid() = influencer_id);

DROP POLICY IF EXISTS "Influencer manage moments" ON public.life_moments;
CREATE POLICY "Influencer manage moments" ON public.life_moments FOR ALL USING (auth.uid() = influencer_id);

-- 4.4 Campaigns
DROP POLICY IF EXISTS "Public campaigns" ON public.campaigns;
CREATE POLICY "Public campaigns" ON public.campaigns FOR SELECT USING (true);

DROP POLICY IF EXISTS "Brand manage campaigns" ON public.campaigns;
CREATE POLICY "Brand manage campaigns" ON public.campaigns FOR ALL USING (auth.uid() = brand_id);

-- 4.5 Proposals (Unified Logic: Involved Parties Only)
-- Brand Proposals
DROP POLICY IF EXISTS "Brand proposals view" ON public.brand_proposals;
CREATE POLICY "Brand proposals view" ON public.brand_proposals FOR SELECT USING (auth.uid() = brand_id OR auth.uid() = influencer_id);

DROP POLICY IF EXISTS "Brand proposals insert" ON public.brand_proposals;
CREATE POLICY "Brand proposals insert" ON public.brand_proposals FOR INSERT WITH CHECK (auth.uid() = brand_id OR auth.uid() = influencer_id);

DROP POLICY IF EXISTS "Brand proposals update" ON public.brand_proposals;
CREATE POLICY "Brand proposals update" ON public.brand_proposals FOR UPDATE USING (auth.uid() = brand_id OR auth.uid() = influencer_id);

-- Campaign Proposals
DROP POLICY IF EXISTS "Campaign proposals view" ON public.campaign_proposals;
CREATE POLICY "Campaign proposals view" ON public.campaign_proposals FOR SELECT USING (
    auth.uid() = influencer_id OR 
    EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_proposals.campaign_id AND c.brand_id = auth.uid())
);

DROP POLICY IF EXISTS "Campaign proposals insert" ON public.campaign_proposals;
CREATE POLICY "Campaign proposals insert" ON public.campaign_proposals FOR INSERT WITH CHECK (auth.uid() = influencer_id);

DROP POLICY IF EXISTS "Campaign proposals update" ON public.campaign_proposals;
CREATE POLICY "Campaign proposals update" ON public.campaign_proposals FOR UPDATE USING (
    auth.uid() = influencer_id OR 
    EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_proposals.campaign_id AND c.brand_id = auth.uid())
);

-- Moment Proposals (Brand initiates, Influencer accepts)
DROP POLICY IF EXISTS "Moment proposals view" ON public.moment_proposals;
CREATE POLICY "Moment proposals view" ON public.moment_proposals FOR SELECT USING (auth.uid() = brand_id OR auth.uid() = influencer_id);

DROP POLICY IF EXISTS "Moment proposals insert" ON public.moment_proposals;
CREATE POLICY "Moment proposals insert" ON public.moment_proposals FOR INSERT WITH CHECK (auth.uid() = brand_id);

DROP POLICY IF EXISTS "Moment proposals update" ON public.moment_proposals;
CREATE POLICY "Moment proposals update" ON public.moment_proposals FOR UPDATE USING (auth.uid() = brand_id OR auth.uid() = influencer_id);

DROP POLICY IF EXISTS "Moment proposals delete" ON public.moment_proposals;
CREATE POLICY "Moment proposals delete" ON public.moment_proposals FOR DELETE USING (auth.uid() = brand_id OR auth.uid() = influencer_id);

-- 4.6 Messages & Notifications
DROP POLICY IF EXISTS "Message view" ON public.messages;
CREATE POLICY "Message view" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Message insert" ON public.messages;
CREATE POLICY "Message insert" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Message update" ON public.messages;
CREATE POLICY "Message update" ON public.messages FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Notification view" ON public.notifications;
CREATE POLICY "Notification view" ON public.notifications FOR SELECT USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Notification insert" ON public.notifications;
CREATE POLICY "Notification insert" ON public.notifications FOR INSERT WITH CHECK (true); -- System/Triggers invoke this

DROP POLICY IF EXISTS "Notification update" ON public.notifications;
CREATE POLICY "Notification update" ON public.notifications FOR UPDATE USING (auth.uid() = recipient_id);

-- 4.7 Feedback
DROP POLICY IF EXISTS "Feedback view" ON public.submission_feedback;
CREATE POLICY "Feedback view" ON public.submission_feedback FOR SELECT USING (
    sender_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.campaign_proposals p WHERE p.id = proposal_id AND (p.influencer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = p.campaign_id AND c.brand_id = auth.uid()))) OR
    EXISTS (SELECT 1 FROM public.brand_proposals bp WHERE bp.id = brand_proposal_id AND (bp.influencer_id = auth.uid() OR bp.brand_id = auth.uid()))
);

DROP POLICY IF EXISTS "Feedback insert" ON public.submission_feedback;
CREATE POLICY "Feedback insert" ON public.submission_feedback FOR INSERT WITH CHECK (sender_id = auth.uid());

-- 4.8 Favorites
DROP POLICY IF EXISTS "Favorites manage" ON public.favorites;
CREATE POLICY "Favorites manage" ON public.favorites FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- 5. STORAGE BUCKETS
-- ==========================================
INSERT INTO storage.buckets (id, name, public) VALUES 
('product-images', 'product-images', true),
('campaigns', 'campaigns', true),
('submissions', 'submissions', true),
('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies
-- (Already handled with DO block in previous snippet, ensuring idempotency here too)
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public Access" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
    DROP POLICY IF EXISTS "Owner Update" ON storage.objects;
    DROP POLICY IF EXISTS "Owner Delete" ON storage.objects;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (true);
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Owner Update" ON storage.objects FOR UPDATE USING (auth.uid() = owner);
CREATE POLICY "Owner Delete" ON storage.objects FOR DELETE USING (auth.uid() = owner);

-- ==========================================
-- 6. PERMISSIONS & CLEANUP
-- ==========================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';

-- 7. NOTIFICATIONS (Functions for Triggers)
-- 8.1 CAMPAIGN APPLICATION NOTIFICATION
CREATE OR REPLACE FUNCTION notify_brand_on_campaign_application()
RETURNS TRIGGER AS $$
DECLARE
    campaign_name TEXT;
    brand_user_id UUID;
    influencer_name TEXT;
BEGIN
    SELECT title, brand_id INTO campaign_name, brand_user_id
    FROM campaigns WHERE id = NEW.campaign_id;
    
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

-- 8.3 MESSAGE RECEIVED NOTIFICATION
CREATE OR REPLACE FUNCTION notify_user_on_message()
RETURNS TRIGGER AS $$
DECLARE
    sender_name TEXT;
BEGIN
    SELECT display_name INTO sender_name
    FROM profiles WHERE id = NEW.sender_id;
    
    INSERT INTO notifications (recipient_id, sender_id, type, content, reference_id)
    VALUES (
        NEW.receiver_id,
        NEW.sender_id,
        'message_received',
        sender_name || '님이 메시지를 보냈습니다: ' || LEFT(NEW.content, 20) || '...',
        NEW.id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_message_created ON messages;
CREATE TRIGGER on_message_created
    AFTER INSERT ON messages
    FOR EACH ROW
    WHEN (NEW.sender_id IS DISTINCT FROM NEW.receiver_id)
    EXECUTE PROCEDURE notify_user_on_message();

-- End of Master Schema V3.0

-- ==========================================
-- 8. DATA MIGRATION (Consolidated)
-- ==========================================

-- 8.1 Migrate Existing Users to Teams (Safe & Idempotent)
DO $$
DECLARE
    user_record RECORD;
    new_team_id UUID;
    base_slug TEXT;
    final_slug TEXT;
    counter INT;
    slug_prefix TEXT;
BEGIN
    -- Loop through ALL users (Brand & Influencer) who don't have a team yet
    FOR user_record IN 
        SELECT * FROM public.profiles 
        WHERE id NOT IN (SELECT user_id FROM public.team_members)
    LOOP
        -- Determine slug prefix based on role
        IF user_record.role = 'brand' THEN
            slug_prefix := 'brand';
        ELSE
            slug_prefix := 'creator';
        END IF;

        -- Generate unique slug
        base_slug := lower(regexp_replace(COALESCE(user_record.display_name, split_part(user_record.email, '@', 1)), '[^a-zA-Z0-9]', '', 'g'));
        IF base_slug = '' THEN base_slug := slug_prefix; END IF;
        
        final_slug := base_slug;
        counter := 1;
        
        WHILE EXISTS (SELECT 1 FROM public.teams WHERE slug = final_slug) LOOP
            final_slug := base_slug || counter;
            counter := counter + 1;
        END LOOP;

        -- Create Team
        INSERT INTO public.teams (name, slug, logo_url, created_at, updated_at)
        VALUES (
            COALESCE(user_record.display_name, 'My Team'),
            final_slug,
            user_record.avatar_url,
            user_record.created_at,
            user_record.updated_at
        )
        RETURNING id INTO new_team_id;

        -- Add Member as Owner
        INSERT INTO public.team_members (team_id, user_id, role, created_at)
        VALUES (
            new_team_id,
            user_record.id,
            'owner',
            user_record.created_at
        );
        
        RAISE NOTICE 'Migrated user to team: % (Role: %)', user_record.email, user_record.role;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 9. AGENCY TEAM SUPPORT MIGRATION
-- ==========================================

-- 9.1 Add team_id columns to all data tables
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id);
ALTER TABLE public.brand_products ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id);
ALTER TABLE public.life_moments ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id);
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS brand_team_id UUID REFERENCES public.teams(id);
ALTER TABLE public.brand_proposals ADD COLUMN IF NOT EXISTS influencer_team_id UUID REFERENCES public.teams(id);
ALTER TABLE public.campaign_proposals ADD COLUMN IF NOT EXISTS influencer_team_id UUID REFERENCES public.teams(id);
ALTER TABLE public.moment_proposals ADD COLUMN IF NOT EXISTS brand_team_id UUID REFERENCES public.teams(id);
ALTER TABLE public.moment_proposals ADD COLUMN IF NOT EXISTS influencer_team_id UUID REFERENCES public.teams(id);

-- 9.2 Backfill team_id from current owners
-- Campaigns: brand_id -> team owned by that brand
UPDATE public.campaigns c
SET team_id = tm.team_id
FROM public.team_members tm
WHERE c.brand_id = tm.user_id 
  AND tm.role = 'owner'
  AND c.team_id IS NULL;

-- Products: brand_id -> team owned by that brand
UPDATE public.brand_products p
SET team_id = tm.team_id
FROM public.team_members tm
WHERE p.brand_id = tm.user_id 
  AND tm.role = 'owner'
  AND p.team_id IS NULL;

-- Moments: influencer_id -> team owned by that creator
UPDATE public.life_moments m
SET team_id = tm.team_id
FROM public.team_members tm
WHERE m.influencer_id = tm.user_id 
  AND tm.role = 'owner'
  AND m.team_id IS NULL;

-- Brand Proposals: backfill both sides
UPDATE public.brand_proposals bp
SET brand_team_id = btm.team_id,
    influencer_team_id = itm.team_id
FROM public.team_members btm, public.team_members itm
WHERE bp.brand_id = btm.user_id AND btm.role = 'owner'
  AND bp.influencer_id = itm.user_id AND itm.role = 'owner'
  AND bp.brand_team_id IS NULL;

-- Campaign Proposals
UPDATE public.campaign_proposals cp
SET influencer_team_id = tm.team_id
FROM public.team_members tm
WHERE cp.influencer_id = tm.user_id 
  AND tm.role = 'owner'
  AND cp.influencer_team_id IS NULL;

-- Moment Proposals
UPDATE public.moment_proposals mp
SET brand_team_id = btm.team_id,
    influencer_team_id = itm.team_id
FROM public.team_members btm, public.team_members itm
WHERE mp.brand_id = btm.user_id AND btm.role = 'owner'
  AND mp.influencer_id = itm.user_id AND itm.role = 'owner'
  AND mp.brand_team_id IS NULL;

-- 9.3 Update RLS Policies to use Teams
-- Campaigns
DROP POLICY IF EXISTS "Brand manage campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Team manage campaigns" ON public.campaigns;
CREATE POLICY "Team manage campaigns" ON public.campaigns FOR ALL USING (
    team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);

-- Products
DROP POLICY IF EXISTS "Brand manage products" ON public.brand_products;
DROP POLICY IF EXISTS "Team manage products" ON public.brand_products;
CREATE POLICY "Team manage products" ON public.brand_products FOR ALL USING (
    team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);

-- Moments
DROP POLICY IF EXISTS "Influencer manage moments" ON public.life_moments;
DROP POLICY IF EXISTS "Team manage moments" ON public.life_moments;
CREATE POLICY "Team manage moments" ON public.life_moments FOR ALL USING (
    team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);

-- Proposals View (keep existing view policies for backward compatibility)
-- Brand Proposals
DROP POLICY IF EXISTS "Brand proposals insert" ON public.brand_proposals;
DROP POLICY IF EXISTS "Team proposals insert" ON public.brand_proposals;
CREATE POLICY "Team proposals insert" ON public.brand_proposals FOR INSERT WITH CHECK (
    brand_team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()) OR
    influencer_team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Brand proposals update" ON public.brand_proposals;
DROP POLICY IF EXISTS "Team proposals update" ON public.brand_proposals;
CREATE POLICY "Team proposals update" ON public.brand_proposals FOR UPDATE USING (
    brand_team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()) OR
    influencer_team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);

-- Campaign Proposals
DROP POLICY IF EXISTS "Campaign proposals insert" ON public.campaign_proposals;
DROP POLICY IF EXISTS "Team campaign proposals insert" ON public.campaign_proposals;
CREATE POLICY "Team campaign proposals insert" ON public.campaign_proposals FOR INSERT WITH CHECK (
    influencer_team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Campaign proposals update" ON public.campaign_proposals;
DROP POLICY IF EXISTS "Team campaign proposals update" ON public.campaign_proposals;
CREATE POLICY "Team campaign proposals update" ON public.campaign_proposals FOR UPDATE USING (
    influencer_team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_proposals.campaign_id AND c.team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()))
);

-- Moment Proposals
DROP POLICY IF EXISTS "Moment proposals insert" ON public.moment_proposals;
DROP POLICY IF EXISTS "Team moment proposals insert" ON public.moment_proposals;
CREATE POLICY "Team moment proposals insert" ON public.moment_proposals FOR INSERT WITH CHECK (
    brand_team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Moment proposals update" ON public.moment_proposals;
DROP POLICY IF EXISTS "Team moment proposals update" ON public.moment_proposals;
CREATE POLICY "Team moment proposals update" ON public.moment_proposals FOR UPDATE USING (
    brand_team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()) OR
    influencer_team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Moment proposals delete" ON public.moment_proposals;
DROP POLICY IF EXISTS "Team moment proposals delete" ON public.moment_proposals;
CREATE POLICY "Team moment proposals delete" ON public.moment_proposals FOR DELETE USING (
    brand_team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()) OR
    influencer_team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);

NOTIFY pgrst, 'reload schema';


-- ==========================================
-- 11. MCN Proxy Support & Team Permissions
-- ==========================================

-- 1. Update RLS for life_moments to allow team members to INSERT/UPDATE for their team's influencers
DROP POLICY IF EXISTS "Influencer manage moments" ON public.life_moments;
DROP POLICY IF EXISTS "Team manage moments" ON public.life_moments;

-- Allow SELECT for everyone (public moments) or own team's private moments
CREATE POLICY "Public view moments" ON public.life_moments FOR SELECT USING (
    is_private = false OR 
    auth.uid() = influencer_id OR
    team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()) OR 
    EXISTS (SELECT 1 FROM public.team_members WHERE user_id = influencer_id AND team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()))
);

-- Allow INSERT if user is the influencer OR a member of the same team as the influencer
CREATE POLICY "Team manage moments" ON public.life_moments FOR ALL USING (
    auth.uid() = influencer_id OR
    team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);

-- 2. Update RLS for campaign_applications to allow proxy application
ALTER TABLE public.campaign_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Influencer manage applications" ON public.campaign_applications;
DROP POLICY IF EXISTS "Team manage applications" ON public.campaign_applications;

CREATE POLICY "Team manage applications" ON public.campaign_applications FOR ALL USING (
    auth.uid() = applicant_id OR
    EXISTS (SELECT 1 FROM public.team_members WHERE user_id = applicant_id AND team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()))
);

NOTIFY pgrst, 'reload schema';

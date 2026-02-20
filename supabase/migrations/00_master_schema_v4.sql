-- =====================================================
-- 👑 MASTER SCHEMA V4.0 — Single Source of Truth
-- =====================================================
-- Last Updated: 2026-02-20
-- This file reflects the ACTUAL live Supabase DB state.
-- Idempotent: safe to run multiple times.
-- =====================================================

-- =====================================================
-- 1. EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. TABLES
-- =====================================================

-- 2.1 PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  avatar_url text,
  role text,  -- 'brand', 'creator', 'mcn', 'agency', 'admin'
  phone text,
  instagram_handle text,
  description text,
  website text,
  is_mock boolean DEFAULT false,
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Creator Stats
  followers_count integer DEFAULT 0,
  tier text,
  tags text[] DEFAULT '{}',

  -- Rate Card
  price_video integer DEFAULT 0,
  price_feed integer DEFAULT 0,
  price_story integer DEFAULT 0,
  price_usage_rights integer DEFAULT 0,
  price_auto_dm integer DEFAULT 0,

  -- Legacy Rate Fields
  secondary_rights boolean DEFAULT false,
  usage_rights_month integer DEFAULT 0,
  usage_rights_price integer DEFAULT 0,
  auto_dm_month integer DEFAULT 0,
  auto_dm_price integer DEFAULT 0,

  -- Shipping
  shipping_address text,
  primary_region text,

  -- Bank Info
  bank_name text,
  account_number text,
  account_holder text
);

-- 2.2 INSTAGRAM ACCOUNTS
CREATE TABLE IF NOT EXISTS public.instagram_accounts (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  instagram_user_id text,
  access_token text,
  page_id text,
  username text,
  profile_picture_url text,
  follower_count integer,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 2.3 SOCIAL CHANNELS
CREATE TABLE IF NOT EXISTS public.social_channels (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('instagram', 'youtube', 'blog', 'tiktok', 'other')),
  handle text NOT NULL,
  followers_count integer DEFAULT 0,
  is_primary boolean DEFAULT false,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT unique_user_platform_handle UNIQUE (user_id, platform, handle)
);

-- 2.4 TEAMS
CREATE TABLE IF NOT EXISTS public.teams (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  website text,
  business_registration_number text,
  created_by uuid REFERENCES auth.users DEFAULT auth.uid(),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 2.5 TEAM MEMBERS
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(team_id, user_id)
);

-- 2.6 TEAM INVITATIONS
CREATE TABLE IF NOT EXISTS public.team_invitations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text DEFAULT 'member',
  invited_by uuid REFERENCES public.profiles(id),
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  invite_code text DEFAULT substring(md5(random()::text) from 0 for 12),
  UNIQUE(team_id, email)
);

-- 2.7 LIFE MOMENTS
CREATE TABLE IF NOT EXISTS public.life_moments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  influencer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  name text,
  title text,
  icon text,
  description text,
  target_product text,
  event_date text,
  posting_date text,
  category text,
  tags text[],
  channels text[] DEFAULT '{}',
  is_verified boolean DEFAULT false,
  status text DEFAULT 'recruiting',
  is_mock boolean DEFAULT false,
  is_private boolean DEFAULT false,
  schedule jsonb DEFAULT '{}'::jsonb,
  guide text,
  price_video integer,
  date_flexible boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 2.8 BRAND PRODUCTS
CREATE TABLE IF NOT EXISTS public.brand_products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price integer DEFAULT 0,
  category text,
  image_url text,
  selling_points text,
  required_shots text,
  website_url text,  -- NOTE: brand_products uses website_url (not website)
  content_guide text,
  format_guide text,
  tags text[],
  channels text[] DEFAULT '{}',
  account_tag text,
  is_mock boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 2.9 CAMPAIGNS
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
  product_type text DEFAULT 'gift',
  team_id uuid REFERENCES public.teams(id),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 2.10 BRAND PROPOSALS
CREATE TABLE IF NOT EXISTS public.brand_proposals (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  brand_id uuid REFERENCES public.profiles(id) NOT NULL,
  influencer_id uuid REFERENCES public.profiles(id) NOT NULL,
  influencer_team_id uuid REFERENCES public.teams(id),
  product_id uuid REFERENCES public.brand_products(id),
  product_name text NOT NULL,
  product_type text DEFAULT 'gift',
  product_url text,
  price_offer bigint,
  compensation_amount text,
  has_incentive boolean DEFAULT false,
  incentive_detail text,
  content_type text,
  message text,
  status text DEFAULT 'offered',
  event_id uuid REFERENCES public.life_moments(id) ON DELETE SET NULL,
  workspace_id uuid,
  channel_name text,
  channel_url text,
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
  brand_condition_confirmed boolean DEFAULT false,
  influencer_condition_confirmed boolean DEFAULT false,
  special_terms text,
  -- Contract
  contract_content text,
  contract_status text DEFAULT 'none',
  brand_signature text,
  influencer_signature text,
  brand_signed_at timestamptz,
  influencer_signed_at timestamptz,
  -- Submission
  content_submission_url text,
  content_submission_file_url text,
  content_submission_status text DEFAULT 'pending',
  content_submission_date timestamptz,
  content_submission_version numeric(3,1) DEFAULT 1.0,
  content_submission_url_2 text,
  content_submission_file_url_2 text,
  content_submission_status_2 text DEFAULT 'pending',
  content_submission_date_2 timestamptz,
  -- Meta
  is_mock boolean DEFAULT false,
  insight_screenshot text,
  instagram_handle text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 2.11 MOMENT PROPOSALS
CREATE TABLE IF NOT EXISTS public.moment_proposals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id uuid REFERENCES public.profiles(id) NOT NULL,
  brand_team_id uuid REFERENCES public.teams(id),
  influencer_id uuid REFERENCES public.profiles(id) NOT NULL,
  influencer_team_id uuid REFERENCES public.teams(id),
  moment_id uuid REFERENCES public.life_moments(id) NOT NULL,
  product_id uuid REFERENCES public.brand_products(id),
  product_url text,
  product_name text NOT NULL,
  product_type text DEFAULT 'gift',
  compensation_amount text,
  price_offer bigint,
  has_incentive boolean DEFAULT false,
  incentive_detail text,
  content_type text,
  message text,
  status text DEFAULT 'offered',
  workspace_id uuid,
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
  brand_condition_confirmed boolean DEFAULT false,
  influencer_condition_confirmed boolean DEFAULT false,
  special_terms text,
  conditions jsonb DEFAULT '{}'::jsonb,
  -- Contract
  contract_content text,
  contract_status text DEFAULT 'none',
  brand_signature text,
  influencer_signature text,
  brand_signed_at timestamptz,
  influencer_signed_at timestamptz,
  -- Submission
  content_submission_url text,
  content_submission_file_url text,
  content_submission_status text DEFAULT 'pending',
  content_submission_date timestamptz,
  content_submission_version numeric(3,1) DEFAULT 1.0,
  content_submission_url_2 text,
  content_submission_file_url_2 text,
  content_submission_status_2 text DEFAULT 'pending',
  content_submission_date_2 timestamptz,
  content_submission_version_2 numeric(3,1) DEFAULT 0.9,
  -- Meta
  is_mock boolean DEFAULT false,
  insight_screenshot text,
  motivation text,
  content_plan text,
  portfolio_links text[],
  instagram_handle text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 2.12 CAMPAIGN APPLICATIONS
CREATE TABLE IF NOT EXISTS public.campaign_applications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id uuid REFERENCES public.campaigns(id) NOT NULL,
  influencer_id uuid REFERENCES public.profiles(id) NOT NULL,
  influencer_team_id uuid REFERENCES public.teams(id),
  message text,
  price_offer integer,
  status text DEFAULT 'pending',
  motivation text,
  content_plan text,
  portfolio_links text[],
  instagram_handle text,
  insight_screenshot text,
  workspace_id uuid,
  channel_name text,
  channel_url text,
  channel_subtype text,
  -- Logistics
  shipping_name text,
  shipping_phone text,
  shipping_address text,
  tracking_number text,
  delivery_status text DEFAULT 'pending',
  -- Contract
  contract_content text,
  contract_status text DEFAULT 'none',
  brand_signature text,
  influencer_signature text,
  brand_signed_at timestamptz,
  influencer_signed_at timestamptz,
  -- Conditions
  condition_product_receipt_date text,
  condition_plan_sharing_date text,
  condition_draft_submission_date text,
  condition_final_submission_date text,
  condition_upload_date text,
  condition_maintenance_period text,
  condition_secondary_usage_period text,
  brand_condition_confirmed boolean DEFAULT false,
  influencer_condition_confirmed boolean DEFAULT false,
  special_terms text,
  -- Submission
  content_submission_url text,
  content_submission_file_url text,
  content_submission_status text DEFAULT 'pending',
  content_submission_date timestamptz,
  content_submission_version numeric(3,1) DEFAULT 1.0,
  content_submission_url_2 text,
  content_submission_file_url_2 text,
  content_submission_status_2 text DEFAULT 'pending',
  content_submission_date_2 timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 2.13 WORKSPACES
CREATE TABLE IF NOT EXISTS public.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES auth.users(id),
  influencer_id uuid NOT NULL REFERENCES auth.users(id),
  proposal_type text NOT NULL CHECK (proposal_type IN ('brand_proposal','moment_proposal','campaign_application')),
  proposal_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 2.14 MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  brand_proposal_id uuid REFERENCES public.brand_proposals(id) ON DELETE SET NULL,
  proposal_id uuid,
  sender_id uuid REFERENCES public.profiles(id) NOT NULL,
  receiver_id uuid REFERENCES public.profiles(id) NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  is_mock boolean DEFAULT false,
  workspace_id uuid,
  file_url text,
  file_name text,
  file_size integer,
  file_type text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 2.15 NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipient_id uuid REFERENCES public.profiles(id) NOT NULL,
  sender_id uuid REFERENCES public.profiles(id),
  type text NOT NULL,
  content text NOT NULL,
  reference_id uuid,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 2.16 SUBMISSION FEEDBACK
CREATE TABLE IF NOT EXISTS public.submission_feedback (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  brand_proposal_id uuid REFERENCES public.brand_proposals(id) ON DELETE CASCADE,
  proposal_id uuid,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 2.17 FAVORITES
CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  target_id uuid NOT NULL,
  target_type text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, target_id, target_type)
);

-- =====================================================
-- 3. INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_code ON public.team_invitations(invite_code);
CREATE INDEX IF NOT EXISTS idx_team_invitations_team_id ON public.team_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON public.team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_social_channels_user_id ON public.social_channels(user_id);
CREATE INDEX IF NOT EXISTS idx_social_channels_platform ON public.social_channels(platform);
CREATE INDEX IF NOT EXISTS idx_social_channels_is_primary ON public.social_channels(user_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_life_moments_channels ON public.life_moments USING GIN (channels);
CREATE INDEX IF NOT EXISTS idx_brand_products_channels ON public.brand_products USING GIN (channels);

-- =====================================================
-- 4. HELPER FUNCTIONS (RLS & Auth)
-- =====================================================

-- 4.1 Get user's team IDs (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.get_user_team_ids(target_user_id UUID)
RETURNS SETOF UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public VOLATILE
AS $$
BEGIN
    SET LOCAL row_security = off;
    RETURN QUERY SELECT team_id FROM public.team_members WHERE user_id = target_user_id;
END;
$$;

-- 4.2 Check if user is owner/admin
CREATE OR REPLACE FUNCTION public.is_team_owner_or_admin(target_team_id UUID, target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public VOLATILE
AS $$
DECLARE user_role TEXT;
BEGIN
    SET LOCAL row_security = off;
    SELECT role INTO user_role FROM public.team_members
    WHERE team_id = target_team_id AND user_id = target_user_id LIMIT 1;
    RETURN (user_role = 'owner' OR user_role = 'admin');
END;
$$;

-- 4.3 Login RPC (bypasses RLS for fast profile fetch)
CREATE OR REPLACE FUNCTION public.get_current_user_info()
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public VOLATILE
AS $$
DECLARE
    current_user_id UUID;
    result json;
BEGIN
    current_user_id := auth.uid();
    IF current_user_id IS NULL THEN RETURN NULL; END IF;

    SELECT json_build_object(
        'id', p.id,
        'email', p.email,
        'role', p.role,
        'name', COALESCE(p.display_name, split_part(p.email, '@', 1)),
        'avatar', p.avatar_url,
        'onboardingCompleted', COALESCE(p.onboarding_completed, false),
        'bio', p.description,
        'handle', p.instagram_handle,
        'followers', COALESCE(p.followers_count, 0),
        'tags', COALESCE(p.tags, '{}'::text[]),
        'phone', p.phone,
        'address', p.shipping_address,
        'website', p.website,
        'primaryRegion', p.primary_region,
        'priceVideo', COALESCE(p.price_video, 0),
        'priceFeed', COALESCE(p.price_feed, 0),
        'priceStory', COALESCE(p.price_story, 0),
        'priceUsageRights', COALESCE(p.price_usage_rights, 0),
        'priceAutoDm', COALESCE(p.price_auto_dm, 0),
        'teamId', (SELECT team_id FROM public.team_members WHERE user_id = current_user_id LIMIT 1),
        'bankName', p.bank_name,
        'accountNumber', p.account_number,
        'accountHolder', p.account_holder,
        'usageRightsMonth', COALESCE(p.usage_rights_month, 0),
        'usageRightsPrice', COALESCE(p.usage_rights_price, 0),
        'autoDmMonth', COALESCE(p.auto_dm_month, 0),
        'autoDmPrice', COALESCE(p.auto_dm_price, 0)
    ) INTO result
    FROM public.profiles p
    WHERE p.id = current_user_id;

    RETURN result;
END;
$$;

-- 4.4 Handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions
AS $$
DECLARE
  preferred_role text;
  user_name text;
BEGIN
  preferred_role := new.raw_user_meta_data->>'role';
  user_name := new.raw_user_meta_data->>'name';
  IF user_name IS NULL OR user_name = '' THEN
    user_name := split_part(new.email, '@', 1);
  END IF;

  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (new.id, new.email, user_name, preferred_role)
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name);

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RAISE;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4.5 Auto-add team owner on team creation
CREATE OR REPLACE FUNCTION public.handle_new_team()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
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

-- =====================================================
-- 5. RLS POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moment_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- NOTE: Detailed RLS policies are managed live in Supabase.
-- The grand_unification_rls migration was applied 2026-02-20 
-- and uses get_user_team_ids() to prevent recursion.
-- See Supabase Dashboard > Authentication > Policies for current state.

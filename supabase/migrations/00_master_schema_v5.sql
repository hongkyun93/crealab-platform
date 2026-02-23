-- =====================================================
-- 👑 MASTER SCHEMA V5.0 — Single Source of Truth
-- =====================================================
-- Last Updated: 2026-02-23
-- Reflects ALL migrations applied through 20260223.
-- Idempotent: safe to run multiple times.
--
-- Changelog from V4.0 (2026-02-20):
--   - brand_proposals  → product_applications (rename)
--   - messages.brand_proposal_id → product_application_id
--   - submission_feedback.brand_proposal_id → product_application_id
--   - workspaces CHECK constraint updated
--   - profiles: +15 columns (brand biz info, creator legal/tax)
--   - product_applications/moment_proposals/campaign_applications:
--       +channel_subtype, +receiver_name, +shipping_phone, +shipping_address
--       +content_final_url, +content_clean_url, +content_submission_*
--       +secondary_usage_fee, +payment_confirmed_at
--       +content_final_approved_at, +content_revision_requested_at
--   - life_moments: +event_start_date, +event_end_date, +posting_date_exact
--   - submission_feedback: +video_timestamp_seconds, +product_application_id
--   - teams: +representative_name, +business_address, +stamp_url
--   - NEW: settlements (withholding 포함)
--   - NEW: mcn_revenue_splits
--   - NEW: brand_deposits
--   - NEW: workspace_files
--   - NEW: fn_auto_create_settlement trigger (3 tables)
--   - NEW: is_admin() function
--   - NEW: generate_statement_number() function
--   - NEW: can_access_submission_feedback() function
--   - UPDATED: get_current_user_info() — brand/creator 확장 필드 포함
--   - UPDATED: get_team_settlements() — withholding 컬럼 포함
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

  -- Rate Card (current)
  price_video integer DEFAULT 0,
  price_feed integer DEFAULT 0,
  price_story integer DEFAULT 0,
  price_usage_rights integer DEFAULT 0,
  price_auto_dm integer DEFAULT 0,

  -- Rate Card (legacy — kept for backward compat, will be removed)
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
  account_holder text,

  -- [+20260220] Brand Business Info
  representative_name text,
  business_number text,
  company_address text,
  company_phone text,
  tax_email text,
  business_category text,
  business_type text,
  contact_person_name text,
  contact_person_phone text,
  contact_person_email text,
  settlement_bank text,

  -- [+20260220] Creator Legal/Tax Info
  legal_name text,
  birth_date text,
  legal_address text,
  is_business_registered boolean DEFAULT false,
  creator_business_number text,

  -- [+] Deposit balance (for brand)
  deposit_balance integer DEFAULT 0
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
  -- [+20260223] MCN Business Info
  representative_name text,
  business_address text,
  stamp_url text,
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

-- 2.7 LIFE MOMENTS (influencer_events alias)
CREATE TABLE IF NOT EXISTS public.life_moments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  influencer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,  -- [+20260220]
  name text,
  title text,
  icon text,
  description text,
  target_product text,
  event_date text,          -- year-month display (brand visible)
  posting_date text,        -- year-month display (brand visible)
  -- [+20260222] Exact dates (private — creator/MCN only)
  event_start_date date,
  event_end_date date,
  posting_date_exact date,
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
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,  -- [+20260220]
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

-- 2.10 PRODUCT APPLICATIONS  [renamed from brand_proposals @ 20260223]
CREATE TABLE IF NOT EXISTS public.product_applications (
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
  -- [+20260221] channel
  channel_subtype text,
  -- Logistics
  shipping_name text,
  shipping_phone text,
  shipping_address text,
  -- [+20260221] Shipping
  receiver_name text,
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
  -- [+20260221] Content final/clean
  content_final_url text,
  content_clean_url text,
  -- [+20260221] Secondary usage fee
  secondary_usage_fee integer DEFAULT 0,
  -- [+20260222] Payment
  payment_confirmed_at timestamptz,
  -- [+20260222] Video review
  content_final_approved_at timestamptz,
  content_revision_requested_at timestamptz,
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
  receiver_name text,             -- [+20260221]
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
  -- [+20260221] Content final/clean
  content_final_url text,
  content_clean_url text,
  -- [+20260221] Channel
  channel_name text,
  channel_subtype text,
  -- [+20260221] Secondary usage fee
  secondary_usage_fee integer DEFAULT 0,
  -- [+20260222] Payment
  payment_confirmed_at timestamptz,
  -- [+20260222] Video review
  content_final_approved_at timestamptz,
  content_revision_requested_at timestamptz,
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
  channel_subtype text,           -- [+20260221]
  -- Logistics
  shipping_name text,
  shipping_phone text,
  shipping_address text,
  receiver_name text,             -- [+20260221]
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
  -- [+20260221] Content final/clean
  content_final_url text,
  content_clean_url text,
  -- [+20260221] Secondary usage fee
  secondary_usage_fee integer DEFAULT 0,
  -- [+20260222] Payment
  payment_confirmed_at timestamptz,
  -- [+20260222] Video review
  content_final_approved_at timestamptz,
  content_revision_requested_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 2.13 WORKSPACES
CREATE TABLE IF NOT EXISTS public.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES auth.users(id),
  influencer_id uuid NOT NULL REFERENCES auth.users(id),
  proposal_type text NOT NULL CHECK (proposal_type IN ('product_application','moment_proposal','campaign_application')),
  proposal_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 2.14 MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_application_id uuid,    -- [renamed from brand_proposal_id @ 20260223] FK removed
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
  product_application_id uuid,    -- [renamed from brand_proposal_id @ 20260223] FK removed
  proposal_id uuid,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  video_timestamp_seconds numeric(8,2),  -- [+20260222] video bookmark
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

-- 2.18 MCN REVENUE SPLITS  [NEW @ 20260222]
CREATE TABLE IF NOT EXISTS public.mcn_revenue_splits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  split_ratio numeric(4,3) NOT NULL DEFAULT 0.700
    CHECK (split_ratio >= 0 AND split_ratio <= 1),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(team_id, creator_id)
);

-- 2.19 SETTLEMENTS  [NEW @ 20260222, withholding columns added @ 20260222]
CREATE TABLE IF NOT EXISTS public.settlements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES public.profiles(id),
  brand_id uuid REFERENCES public.profiles(id),
  proposal_type text NOT NULL,   -- 'product_application' | 'moment_proposal' | 'campaign_application'
  proposal_id text NOT NULL,
  gross_amount integer NOT NULL DEFAULT 0,
  split_ratio numeric(4,3) NOT NULL DEFAULT 0.700,
  creator_amount integer NOT NULL DEFAULT 0,
  mcn_amount integer NOT NULL DEFAULT 0,
  -- [+20260222] Withholding tax (원천세 3.3%)
  withholding_rate numeric(5,4) NOT NULL DEFAULT 0.033,
  withholding_amount integer NOT NULL DEFAULT 0,
  net_creator_amount integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',  -- 'pending' | 'paid'
  paid_at timestamptz,
  settlement_month text,         -- 'YYYY-MM'
  -- [+20260223] Statement number (YYYYMM-XXXXX)
  statement_number text,
  note text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 2.20 BRAND DEPOSITS  [NEW @ 20260223 — applied manually in Supabase]
CREATE TABLE IF NOT EXISTS public.brand_deposits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  type text NOT NULL CHECK (type IN ('charge', 'use', 'refund')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  note text,
  confirmed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 2.21 WORKSPACE FILES  [NEW @ 20260222]
CREATE TABLE IF NOT EXISTS public.workspace_files (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid,
  product_application_id uuid REFERENCES public.product_applications(id) ON DELETE CASCADE,
  proposal_id uuid,
  moment_proposal_id uuid,
  uploader_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size integer,
  file_type text,
  created_at timestamptz DEFAULT now() NOT NULL
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
-- [+20260222] Payment indexes
CREATE INDEX IF NOT EXISTS idx_product_applications_payment ON public.product_applications (payment_confirmed_at, contract_status);
CREATE INDEX IF NOT EXISTS idx_moment_proposals_payment ON public.moment_proposals (payment_confirmed_at, contract_status);
-- [+20260222] Workspace files indexes
CREATE INDEX IF NOT EXISTS workspace_files_workspace_id_idx ON public.workspace_files(workspace_id);
CREATE INDEX IF NOT EXISTS workspace_files_product_application_id_idx ON public.workspace_files(product_application_id);
CREATE INDEX IF NOT EXISTS workspace_files_proposal_id_idx ON public.workspace_files(proposal_id);
CREATE INDEX IF NOT EXISTS workspace_files_moment_proposal_id_idx ON public.workspace_files(moment_proposal_id);

-- =====================================================
-- 4. HELPER FUNCTIONS (RLS & Auth)
-- =====================================================

-- 4.1 Get user's team IDs
CREATE OR REPLACE FUNCTION public.get_user_team_ids(target_user_id UUID)
RETURNS SETOF UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public VOLATILE
AS $$
BEGIN
    SET LOCAL row_security = off;
    RETURN QUERY SELECT team_id FROM public.team_members WHERE user_id = target_user_id;
END;
$$;

-- 4.2 Check if user is owner/admin of a team
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
-- [UPDATED @ 20260220] Added brand/creator extended fields
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
        'autoDmPrice', COALESCE(p.auto_dm_price, 0),
        -- Brand Business Fields [+20260220]
        'representativeName', p.representative_name,
        'businessNumber', p.business_number,
        'companyAddress', p.company_address,
        'companyPhone', p.company_phone,
        'taxEmail', p.tax_email,
        'businessCategory', p.business_category,
        'businessType', p.business_type,
        'contactPersonName', p.contact_person_name,
        'contactPersonPhone', p.contact_person_phone,
        'contactPersonEmail', p.contact_person_email,
        'settlementBank', p.settlement_bank,
        -- Creator Legal/Tax Fields [+20260220]
        'legalName', p.legal_name,
        'birthDate', p.birth_date,
        'legalAddress', p.legal_address,
        'isBusinessRegistered', COALESCE(p.is_business_registered, false),
        'creatorBusinessNumber', p.creator_business_number
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

-- 4.6 Check if current user is admin  [NEW @ 20260222]
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

-- 4.7 Auto-create settlement on proposal completion  [NEW @ 20260222]
CREATE OR REPLACE FUNCTION public.fn_auto_create_settlement()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_creator_id    uuid;
  v_brand_id      uuid;
  v_price_offer   integer;
  v_team_id       uuid;
  v_split_ratio   numeric(4,3);
  v_gross         integer;
  v_creator_amt   integer;
  v_mcn_amt       integer;
  v_withhold_rate numeric(5,4) := 0.033;
  v_withhold_amt  integer;
  v_net_amt       integer;
  v_prop_type     text;
  v_prop_id       text;
  v_month         text;
BEGIN
  IF NEW.status != 'completed' OR OLD.status = 'completed' THEN RETURN NEW; END IF;

  IF TG_TABLE_NAME = 'product_applications' THEN
    v_creator_id  := NEW.influencer_id;
    v_brand_id    := NEW.brand_id;
    v_price_offer := COALESCE(NEW.price_offer, 0);
    v_prop_type   := 'product_application';
    v_prop_id     := NEW.id::text;
  ELSIF TG_TABLE_NAME = 'moment_proposals' THEN
    v_creator_id  := NEW.influencer_id;
    v_brand_id    := NEW.brand_id;
    v_price_offer := COALESCE(NEW.price_offer, 0);
    v_prop_type   := 'moment_proposal';
    v_prop_id     := NEW.id::text;
  ELSIF TG_TABLE_NAME = 'campaign_applications' THEN
    v_creator_id  := NEW.influencer_id;
    v_price_offer := COALESCE(NEW.price_offer, 0);
    v_prop_type   := 'campaign_application';
    v_prop_id     := NEW.id::text;
    SELECT brand_id INTO v_brand_id FROM public.campaigns WHERE id = NEW.campaign_id;
  END IF;

  IF v_price_offer <= 0 THEN RETURN NEW; END IF;
  IF EXISTS (SELECT 1 FROM public.settlements WHERE proposal_type=v_prop_type AND proposal_id=v_prop_id) THEN RETURN NEW; END IF;

  SELECT tm.team_id INTO v_team_id
  FROM public.team_members tm
  JOIN public.team_members owner_tm ON owner_tm.team_id=tm.team_id AND owner_tm.role='owner'
  JOIN public.profiles owner_p ON owner_p.id=owner_tm.user_id AND owner_p.role='mcn'
  WHERE tm.user_id=v_creator_id AND tm.role != 'owner' LIMIT 1;

  IF v_team_id IS NULL THEN RETURN NEW; END IF;

  SELECT split_ratio INTO v_split_ratio FROM public.mcn_revenue_splits WHERE team_id=v_team_id AND creator_id=v_creator_id;
  IF v_split_ratio IS NULL THEN v_split_ratio := 0.700; END IF;

  v_gross        := v_price_offer;
  v_creator_amt  := ROUND(v_gross * v_split_ratio);
  v_mcn_amt      := v_gross - v_creator_amt;
  v_withhold_amt := ROUND(v_creator_amt * v_withhold_rate);
  v_net_amt      := v_creator_amt - v_withhold_amt;
  v_month        := TO_CHAR(NOW(), 'YYYY-MM');

  INSERT INTO public.settlements (
    team_id, creator_id, brand_id, proposal_type, proposal_id,
    gross_amount, split_ratio, creator_amount, mcn_amount,
    withholding_rate, withholding_amount, net_creator_amount, status, settlement_month
  ) VALUES (
    v_team_id, v_creator_id, v_brand_id, v_prop_type, v_prop_id,
    v_gross, v_split_ratio, v_creator_amt, v_mcn_amt,
    v_withhold_rate, v_withhold_amt, v_net_amt, 'pending', v_month
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_settlement_on_product_application_complete ON public.product_applications;
DROP TRIGGER IF EXISTS trg_settlement_on_brand_proposal_complete      ON public.product_applications;
CREATE TRIGGER trg_settlement_on_product_application_complete
  AFTER UPDATE OF status ON public.product_applications
  FOR EACH ROW EXECUTE FUNCTION public.fn_auto_create_settlement();

DROP TRIGGER IF EXISTS trg_settlement_on_moment_proposal_complete ON public.moment_proposals;
CREATE TRIGGER trg_settlement_on_moment_proposal_complete
  AFTER UPDATE OF status ON public.moment_proposals
  FOR EACH ROW EXECUTE FUNCTION public.fn_auto_create_settlement();

DROP TRIGGER IF EXISTS trg_settlement_on_campaign_app_complete ON public.campaign_applications;
CREATE TRIGGER trg_settlement_on_campaign_app_complete
  AFTER UPDATE OF status ON public.campaign_applications
  FOR EACH ROW EXECUTE FUNCTION public.fn_auto_create_settlement();

-- 4.8 Generate statement number  [NEW @ 20260223]
CREATE OR REPLACE FUNCTION public.generate_statement_number(
  target_team_id uuid,
  target_month   text
)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  seq integer;
  result text;
BEGIN
  SELECT COUNT(*) + 1 INTO seq
  FROM public.settlements
  WHERE team_id = target_team_id
    AND settlement_month = target_month
    AND statement_number IS NOT NULL;
  result := replace(target_month, '-', '') || '-' || lpad(seq::text, 5, '0');
  RETURN result;
END;
$$;

-- 4.9 Check if user can access submission_feedback  [NEW @ 20260223]
-- Allows: sender | proposal 당사자 (brand/creator) | 소속 MCN 팀원
CREATE OR REPLACE FUNCTION public.can_access_submission_feedback(p_proposal_id uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
STABLE
AS $$
DECLARE
    v_uid         uuid := auth.uid();
    v_brand_id    uuid;
    v_creator_id  uuid;
    v_in_team     boolean := false;
BEGIN
    IF v_uid IS NULL THEN RETURN false; END IF;

    SELECT brand_id, influencer_id INTO v_brand_id, v_creator_id
    FROM public.product_applications WHERE id = p_proposal_id LIMIT 1;

    IF v_brand_id IS NULL THEN
        SELECT brand_id, influencer_id INTO v_brand_id, v_creator_id
        FROM public.moment_proposals WHERE id = p_proposal_id LIMIT 1;
    END IF;

    IF v_brand_id IS NULL THEN
        SELECT c.brand_id, ca.influencer_id INTO v_brand_id, v_creator_id
        FROM public.campaign_applications ca
        JOIN public.campaigns c ON c.id = ca.campaign_id
        WHERE ca.id = p_proposal_id LIMIT 1;
    END IF;

    IF v_uid = v_brand_id OR v_uid = v_creator_id THEN RETURN true; END IF;

    IF v_creator_id IS NOT NULL THEN
        SELECT EXISTS (
            SELECT 1 FROM public.team_members tm_mcn
            JOIN public.team_members tm_creator ON tm_creator.team_id = tm_mcn.team_id
            WHERE tm_mcn.user_id = v_uid AND tm_creator.user_id = v_creator_id
        ) INTO v_in_team;
    END IF;

    RETURN v_in_team;
END;
$$;

-- 4.10 Settlement RPC  [UPDATED @ 20260222 — withholding columns]
DROP FUNCTION IF EXISTS public.get_team_settlements(uuid, text);
CREATE OR REPLACE FUNCTION public.get_team_settlements(
  target_team_id uuid,
  target_month   text DEFAULT NULL
)
RETURNS TABLE (
  id                 uuid,
  creator_id         uuid,
  creator_name       text,
  creator_avatar     text,
  brand_id           uuid,
  brand_name         text,
  proposal_type      text,
  proposal_id        text,
  gross_amount       integer,
  split_ratio        numeric,
  creator_amount     integer,
  mcn_amount         integer,
  withholding_rate   numeric,
  withholding_amount integer,
  net_creator_amount integer,
  status             text,
  paid_at            timestamptz,
  settlement_month   text,
  statement_number   text,
  note               text,
  created_at         timestamptz
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id, s.creator_id, cp.display_name, cp.avatar_url,
    s.brand_id, bp.display_name,
    s.proposal_type, s.proposal_id,
    s.gross_amount, s.split_ratio, s.creator_amount, s.mcn_amount,
    s.withholding_rate, s.withholding_amount, s.net_creator_amount,
    s.status, s.paid_at, s.settlement_month, s.statement_number, s.note, s.created_at
  FROM public.settlements s
  LEFT JOIN public.profiles cp ON cp.id = s.creator_id
  LEFT JOIN public.profiles bp ON bp.id = s.brand_id
  WHERE s.team_id = target_team_id
    AND (target_month IS NULL OR s.settlement_month = target_month)
  ORDER BY s.created_at DESC;
END;
$$;

-- 4.11 Upsert MCN revenue split
CREATE OR REPLACE FUNCTION public.upsert_revenue_split(
  p_team_id    uuid,
  p_creator_id uuid,
  p_ratio      numeric
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.mcn_revenue_splits (team_id, creator_id, split_ratio)
  VALUES (p_team_id, p_creator_id, p_ratio)
  ON CONFLICT (team_id, creator_id)
  DO UPDATE SET split_ratio = EXCLUDED.split_ratio, updated_at = now();
END;
$$;

-- =====================================================
-- 5. RLS
-- =====================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moment_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcn_revenue_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_files ENABLE ROW LEVEL SECURITY;

-- NOTE: Detailed RLS policies are managed via individual migration files.
-- Key policies applied as of 2026-02-23:
--   messages         → messages_rls_fix.sql / master_fix.sql
--   submission_feedback → submission_feedback_rls_fix.sql (MCN-aware)
--   product_applications → admin_rls_bypass.sql + admin_payment_update_policy.sql
--   moment_proposals, campaign_applications → admin_payment_update_policy.sql
--   settlements, workspaces → admin_rls_bypass.sql
--   teams → mcn_business_info.sql (member select, owner update)
--   workspace_files  → workspace_files.sql

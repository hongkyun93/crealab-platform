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

-- 4.1 Profiles & Details
CREATE POLICY "Public profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Self insert profiles" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Self update profiles" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public influencer_details" ON influencer_details FOR SELECT USING (true);
CREATE POLICY "Self insert details" ON influencer_details FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Self update details" ON influencer_details FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Self view instagram" ON instagram_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Self manage instagram" ON instagram_accounts FOR ALL USING (auth.uid() = user_id);

-- 4.2 Brand Products
CREATE POLICY "Public brand_products" ON brand_products FOR SELECT USING (true);
CREATE POLICY "Brand manage products" ON brand_products FOR ALL USING (auth.uid() = brand_id);

-- 4.3 Life Moments
CREATE POLICY "Public life_moments" ON life_moments FOR SELECT USING (is_private = false OR auth.uid() = influencer_id);
CREATE POLICY "Influencer manage moments" ON life_moments FOR ALL USING (auth.uid() = influencer_id);

-- 4.4 Campaigns
CREATE POLICY "Public campaigns" ON campaigns FOR SELECT USING (true);
CREATE POLICY "Brand manage campaigns" ON campaigns FOR ALL USING (auth.uid() = brand_id);

-- 4.5 Proposals (Unified Logic: Involved Parties Only)
-- Brand Proposals
CREATE POLICY "Brand proposals view" ON brand_proposals FOR SELECT USING (auth.uid() = brand_id OR auth.uid() = influencer_id);
CREATE POLICY "Brand proposals insert" ON brand_proposals FOR INSERT WITH CHECK (auth.uid() = brand_id OR auth.uid() = influencer_id);
CREATE POLICY "Brand proposals update" ON brand_proposals FOR UPDATE USING (auth.uid() = brand_id OR auth.uid() = influencer_id);

-- Campaign Proposals
CREATE POLICY "Campaign proposals view" ON campaign_proposals FOR SELECT USING (
    auth.uid() = influencer_id OR 
    EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_proposals.campaign_id AND c.brand_id = auth.uid())
);
CREATE POLICY "Campaign proposals insert" ON campaign_proposals FOR INSERT WITH CHECK (auth.uid() = influencer_id);
CREATE POLICY "Campaign proposals update" ON campaign_proposals FOR UPDATE USING (
    auth.uid() = influencer_id OR 
    EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_proposals.campaign_id AND c.brand_id = auth.uid())
);

-- Moment Proposals (Brand initiates, Influencer accepts)
CREATE POLICY "Moment proposals view" ON moment_proposals FOR SELECT USING (auth.uid() = brand_id OR auth.uid() = influencer_id);
CREATE POLICY "Moment proposals insert" ON moment_proposals FOR INSERT WITH CHECK (auth.uid() = brand_id);
CREATE POLICY "Moment proposals update" ON moment_proposals FOR UPDATE USING (auth.uid() = brand_id OR auth.uid() = influencer_id);
CREATE POLICY "Moment proposals delete" ON moment_proposals FOR DELETE USING (auth.uid() = brand_id OR auth.uid() = influencer_id);

-- 4.6 Messages & Notifications
CREATE POLICY "Message view" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Message insert" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Message update" ON messages FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Notification view" ON notifications FOR SELECT USING (auth.uid() = recipient_id);
CREATE POLICY "Notification insert" ON notifications FOR INSERT WITH CHECK (true); -- System/Triggers invoke this
CREATE POLICY "Notification update" ON notifications FOR UPDATE USING (auth.uid() = recipient_id);

-- 4.7 Feedback
CREATE POLICY "Feedback view" ON submission_feedback FOR SELECT USING (
    sender_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.campaign_proposals p WHERE p.id = proposal_id AND (p.influencer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = p.campaign_id AND c.brand_id = auth.uid()))) OR
    EXISTS (SELECT 1 FROM public.brand_proposals bp WHERE bp.id = brand_proposal_id AND (bp.influencer_id = auth.uid() OR bp.brand_id = auth.uid()))
);
CREATE POLICY "Feedback insert" ON submission_feedback FOR INSERT WITH CHECK (sender_id = auth.uid());

-- 4.8 Favorites
CREATE POLICY "Favorites manage" ON favorites FOR ALL USING (auth.uid() = user_id);


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

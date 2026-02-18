-- =====================================================
-- Profile Settings & Social Channels Enhancement
-- Migration Date: 2026-02-17
-- =====================================================
-- This migration adds:
-- 1. Primary region field for creators
-- 2. Extended rate card fields (story, usage rights, auto DM)
-- 3. Complete social channels system with dedicated table
-- =====================================================

-- =====================================================
-- PART 1: PROFILES TABLE ENHANCEMENTS
-- =====================================================

-- 1.1 Add Primary Region
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS primary_region text;

COMMENT ON COLUMN public.profiles.primary_region IS '주요 활동 지역 (예: 서울, 부산, 전국)';

-- 1.2 Add Extended Rate Card Fields
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS price_story integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS price_usage_rights integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS price_auto_dm integer DEFAULT 0;

COMMENT ON COLUMN public.profiles.price_story IS '스토리 게시 단가';
COMMENT ON COLUMN public.profiles.price_usage_rights IS '2차 활용권 단가';
COMMENT ON COLUMN public.profiles.price_auto_dm IS '자동 DM 발송 단가';

-- 1.3 Ensure Shipping Address Column Exists
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS shipping_address text;

COMMENT ON COLUMN public.profiles.shipping_address IS '제품 배송지 주소';

-- =====================================================
-- PART 2: SOCIAL CHANNELS TABLE
--=====================================================

-- 2.1 Create Social Channels Table
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
    
    -- Constraints
    CONSTRAINT unique_user_platform_handle UNIQUE (user_id, platform, handle)
);

COMMENT ON TABLE public.social_channels IS '크리에이터 소셜 채널 관리 테이블';
COMMENT ON COLUMN public.social_channels.platform IS '소셜 플랫폼 종류: instagram, youtube, blog, tiktok, other';
COMMENT ON COLUMN public.social_channels.handle IS '플랫폼별 계정 ID (@username)';
COMMENT ON COLUMN public.social_channels.followers_count IS '팔로워/구독자 수';
COMMENT ON COLUMN public.social_channels.is_primary IS '메인 채널 여부 (하나만 true)';
COMMENT ON COLUMN public.social_channels.is_public IS '브랜드에게 공개 여부';

-- 2.2 Create Indexes
CREATE INDEX IF NOT EXISTS idx_social_channels_user_id ON public.social_channels(user_id);
CREATE INDEX IF NOT EXISTS idx_social_channels_platform ON public.social_channels(platform);
CREATE INDEX IF NOT EXISTS idx_social_channels_is_primary ON public.social_channels(user_id, is_primary);

-- 2.3 Create Updated At Trigger
CREATE OR REPLACE FUNCTION update_social_channels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_social_channels_updated_at_trigger ON public.social_channels;

CREATE TRIGGER update_social_channels_updated_at_trigger
    BEFORE UPDATE ON public.social_channels
    FOR EACH ROW
    EXECUTE FUNCTION update_social_channels_updated_at();

-- 2.4 Enforce Single Primary Channel Per User
CREATE OR REPLACE FUNCTION enforce_single_primary_channel()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting this channel as primary
    IF NEW.is_primary = true THEN
        -- Unset any other primary channels for this user
        UPDATE public.social_channels
        SET is_primary = false
        WHERE user_id = NEW.user_id
          AND id != NEW.id
          AND is_primary = true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_single_primary_channel_trigger ON public.social_channels;

CREATE TRIGGER enforce_single_primary_channel_trigger
    BEFORE INSERT OR UPDATE ON public.social_channels
    FOR EACH ROW
    EXECUTE FUNCTION enforce_single_primary_channel();

-- =====================================================
-- PART 3: ROW LEVEL SECURITY (RLS)
-- =====================================================

-- 3.1 Enable RLS on Social Channels
ALTER TABLE public.social_channels ENABLE ROW LEVEL SECURITY;

-- 3.2 Select Policy - Users can view their own channels + public channels of others
DROP POLICY IF EXISTS "Users can view own social channels" ON public.social_channels;
CREATE POLICY "Users can view own social channels"
    ON public.social_channels
    FOR SELECT
    USING (
        user_id = auth.uid()  -- Own channels
        OR is_public = true   -- Public channels
    );

-- 3.3 Insert Policy - Users can only create channels for themselves
DROP POLICY IF EXISTS "Users can insert own social channels" ON public.social_channels;
CREATE POLICY "Users can insert own social channels"
    ON public.social_channels
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- 3.4 Update Policy - Users can update their own channels
DROP POLICY IF EXISTS "Users can update own social channels" ON public.social_channels;
CREATE POLICY "Users can update own social channels"
    ON public.social_channels
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 3.5 Delete Policy - Users can delete their own channels
DROP POLICY IF EXISTS "Users can delete own social channels" ON public.social_channels;
CREATE POLICY "Users can delete own social channels"
    ON public.social_channels
    FOR DELETE
    USING (user_id = auth.uid());

-- 3.6 MCN Proxy Mode Support - MCN can manage team members' channels
DROP POLICY IF EXISTS "MCN can manage team member channels" ON public.social_channels;
CREATE POLICY "MCN can manage team member channels"
    ON public.social_channels
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 
            FROM public.team_members tm
            WHERE tm.user_id = social_channels.user_id
              AND tm.team_id IN (
                  SELECT team_id 
                  FROM public.team_members 
                  WHERE user_id = auth.uid()
              )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM public.team_members tm
            WHERE tm.user_id = social_channels.user_id
              AND tm.team_id IN (
                  SELECT team_id 
                  FROM public.team_members 
                  WHERE user_id = auth.uid()
              )
        )
    );

-- =====================================================
-- PART 4: DATA MIGRATION (OPTIONAL)
-- =====================================================
-- Migrate existing Instagram data to social_channels table
-- Only migrate if instagram_handle exists and is not null

INSERT INTO public.social_channels (user_id, platform, handle, followers_count, is_primary, is_public)
SELECT 
    id as user_id,
    'instagram' as platform,
    instagram_handle as handle,
    COALESCE(followers_count, 0) as followers_count,
    true as is_primary,  -- First channel becomes primary
    true as is_public
FROM public.profiles
WHERE instagram_handle IS NOT NULL 
  AND instagram_handle != ''
  AND id NOT IN (
      SELECT user_id 
      FROM public.social_channels 
      WHERE platform = 'instagram'
  )
ON CONFLICT (user_id, platform, handle) DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check profiles table new columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name IN ('primary_region', 'price_story', 'price_usage_rights', 'price_auto_dm', 'shipping_address');

-- Check social_channels table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'social_channels'
ORDER BY ordinal_position;

-- Count migrated social channels
SELECT COUNT(*) as migrated_channels
FROM public.social_channels;

-- Verify RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'social_channels';

-- =====================================================
-- ROLLBACK SCRIPT (IF NEEDED)
-- =====================================================
/*
-- To rollback this migration:

-- 1. Drop social channels table
DROP TABLE IF EXISTS public.social_channels CASCADE;

-- 2. Drop trigger functions
DROP FUNCTION IF EXISTS update_social_channels_updated_at() CASCADE;
DROP FUNCTION IF EXISTS enforce_single_primary_channel() CASCADE;

-- 3. Remove new profile columns (CAUTION: This will delete data)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS primary_region;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS price_story;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS price_usage_rights;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS price_auto_dm;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS shipping_address;
*/

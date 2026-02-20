-- ==========================================
-- Simplify Login Data Fetching
-- ==========================================
-- Migration Date: 2026-02-20
-- Issue: Login is slow due to heavy RLS checks on client-side joins
-- Solution: Use a SECURITY DEFINER RPC to fetch all needed data in one go

CREATE OR REPLACE FUNCTION public.get_current_user_info()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
VOLATILE
AS $$
DECLARE
    current_user_id UUID;
    result json;
BEGIN
    -- 1. Get current user ID
    current_user_id := auth.uid();
    IF current_user_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- 2. Fetch data joining profiles and team_members
    -- SECURITY DEFINER allows bypassing the complex RLS checks for this specific read
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
        
        -- Rate Card
        'priceVideo', COALESCE(p.price_video, 0),
        'priceFeed', 0,
        'priceStory', COALESCE(p.price_story, 0),
        'priceUsageRights', COALESCE(p.price_usage_rights, 0),
        'priceAutoDm', COALESCE(p.price_auto_dm, 0),
        
        -- Team ID (Single team assumption for now, or primary)
        'teamId', (SELECT team_id FROM public.team_members WHERE user_id = current_user_id limit 1)
    ) INTO result
    FROM public.profiles p
    WHERE p.id = current_user_id;

    RETURN result;
END;
$$;

SELECT 'Created get_current_user_info RPC' as status;

-- =====================================================
-- MCN Dashboard RPC Functions
-- V4.0.3 — MCN Team Aggregation Support
-- =====================================================

-- 1. get_team_dashboard_summary
-- Returns per-creator summary for the MCN home dashboard.
-- Aggregates: moments count, proposals by status, revenue
CREATE OR REPLACE FUNCTION public.get_team_dashboard_summary(target_team_id UUID)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public VOLATILE
AS $$
DECLARE
    caller_id UUID;
    result json;
BEGIN
    caller_id := auth.uid();
    IF caller_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Verify caller is a member of this team (owner/admin/member)
    IF NOT EXISTS (
        SELECT 1 FROM public.team_members
        WHERE team_id = target_team_id AND user_id = caller_id
    ) THEN
        RAISE EXCEPTION 'Not a member of this team';
    END IF;

    SELECT json_agg(creator_summary) INTO result
    FROM (
        SELECT
            tm.user_id,
            p.display_name,
            p.avatar_url,
            p.instagram_handle,
            p.followers_count,
            p.tier,
            p.tags,
            p.price_video,
            p.price_feed,
            -- Moments count
            COALESCE(moment_stats.total_moments, 0) AS total_moments,
            COALESCE(moment_stats.active_moments, 0) AS active_moments,
            -- Brand Proposals stats
            COALESCE(bp_stats.total_proposals, 0) AS total_brand_proposals,
            COALESCE(bp_stats.pending_proposals, 0) AS pending_brand_proposals,
            COALESCE(bp_stats.active_proposals, 0) AS active_brand_proposals,
            COALESCE(bp_stats.total_revenue, 0) AS brand_revenue,
            -- Moment Proposals stats
            COALESCE(mp_stats.total_proposals, 0) AS total_moment_proposals,
            COALESCE(mp_stats.pending_proposals, 0) AS pending_moment_proposals,
            COALESCE(mp_stats.active_proposals, 0) AS active_moment_proposals,
            COALESCE(mp_stats.total_revenue, 0) AS moment_revenue,
            -- Campaign Applications stats
            COALESCE(ca_stats.total_applications, 0) AS total_campaign_applications,
            COALESCE(ca_stats.pending_applications, 0) AS pending_campaign_applications,
            COALESCE(ca_stats.active_applications, 0) AS active_campaign_applications
        FROM public.team_members tm
        JOIN public.profiles p ON p.id = tm.user_id
        -- Moment stats
        LEFT JOIN LATERAL (
            SELECT
                COUNT(*) AS total_moments,
                COUNT(*) FILTER (WHERE lm.status = 'recruiting') AS active_moments
            FROM public.life_moments lm
            WHERE lm.influencer_id = tm.user_id
        ) moment_stats ON true
        -- Brand Proposals stats
        LEFT JOIN LATERAL (
            SELECT
                COUNT(*) AS total_proposals,
                COUNT(*) FILTER (WHERE bp.status = 'offered') AS pending_proposals,
                COUNT(*) FILTER (WHERE bp.status IN ('accepted', 'active', 'in_progress')) AS active_proposals,
                COALESCE(SUM(bp.price_offer) FILTER (WHERE bp.status IN ('accepted', 'active', 'in_progress', 'completed')), 0) AS total_revenue
            FROM public.brand_proposals bp
            WHERE bp.influencer_id = tm.user_id
        ) bp_stats ON true
        -- Moment Proposals stats
        LEFT JOIN LATERAL (
            SELECT
                COUNT(*) AS total_proposals,
                COUNT(*) FILTER (WHERE mp.status = 'offered') AS pending_proposals,
                COUNT(*) FILTER (WHERE mp.status IN ('accepted', 'active', 'in_progress')) AS active_proposals,
                COALESCE(SUM(mp.price_offer) FILTER (WHERE mp.status IN ('accepted', 'active', 'in_progress', 'completed')), 0) AS total_revenue
            FROM public.moment_proposals mp
            WHERE mp.influencer_id = tm.user_id
        ) mp_stats ON true
        -- Campaign Applications stats
        LEFT JOIN LATERAL (
            SELECT
                COUNT(*) AS total_applications,
                COUNT(*) FILTER (WHERE ca.status = 'pending') AS pending_applications,
                COUNT(*) FILTER (WHERE ca.status IN ('accepted', 'active', 'in_progress')) AS active_applications
            FROM public.campaign_applications ca
            WHERE ca.influencer_id = tm.user_id
        ) ca_stats ON true
        WHERE tm.team_id = target_team_id
          AND tm.user_id != caller_id  -- Exclude MCN admin from creator list
        ORDER BY p.display_name
    ) creator_summary;

    RETURN COALESCE(result, '[]'::json);
END;
$$;

-- 2. get_team_proposals
-- Returns all proposals across team members for the unified table view
CREATE OR REPLACE FUNCTION public.get_team_proposals(target_team_id UUID)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public VOLATILE
AS $$
DECLARE
    caller_id UUID;
    result json;
BEGIN
    caller_id := auth.uid();
    IF caller_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Verify caller is a member of this team
    IF NOT EXISTS (
        SELECT 1 FROM public.team_members
        WHERE team_id = target_team_id AND user_id = caller_id
    ) THEN
        RAISE EXCEPTION 'Not a member of this team';
    END IF;

    SELECT json_agg(proposal_row ORDER BY proposal_row.created_at DESC) INTO result
    FROM (
        -- Brand Proposals
        SELECT
            bp.id,
            'brand_proposal' AS proposal_type,
            bp.status,
            bp.product_name,
            bp.price_offer,
            bp.message,
            bp.created_at,
            bp.influencer_id,
            inf.display_name AS creator_name,
            inf.avatar_url AS creator_avatar,
            brand.display_name AS brand_name,
            brand.avatar_url AS brand_avatar,
            bp.content_type,
            bp.brand_condition_confirmed,
            bp.influencer_condition_confirmed,
            bp.contract_status,
            bp.delivery_status
        FROM public.brand_proposals bp
        JOIN public.profiles inf ON inf.id = bp.influencer_id
        JOIN public.profiles brand ON brand.id = bp.brand_id
        WHERE bp.influencer_id IN (
            SELECT user_id FROM public.team_members WHERE team_id = target_team_id AND user_id != caller_id
        )
        UNION ALL
        -- Moment Proposals
        SELECT
            mp.id,
            'moment_proposal' AS proposal_type,
            mp.status,
            mp.product_name,
            mp.price_offer,
            mp.message,
            mp.created_at,
            mp.influencer_id,
            inf.display_name AS creator_name,
            inf.avatar_url AS creator_avatar,
            brand.display_name AS brand_name,
            brand.avatar_url AS brand_avatar,
            mp.content_type,
            mp.brand_condition_confirmed,
            mp.influencer_condition_confirmed,
            mp.contract_status,
            mp.delivery_status
        FROM public.moment_proposals mp
        JOIN public.profiles inf ON inf.id = mp.influencer_id
        JOIN public.profiles brand ON brand.id = mp.brand_id
        WHERE mp.influencer_id IN (
            SELECT user_id FROM public.team_members WHERE team_id = target_team_id AND user_id != caller_id
        )
        UNION ALL
        -- Campaign Applications
        SELECT
            ca.id,
            'campaign_application' AS proposal_type,
            ca.status,
            c.product_name,
            ca.price_offer,
            ca.message,
            ca.created_at,
            ca.influencer_id,
            inf.display_name AS creator_name,
            inf.avatar_url AS creator_avatar,
            brand.display_name AS brand_name,
            brand.avatar_url AS brand_avatar,
            NULL AS content_type,
            NULL::boolean AS brand_condition_confirmed,
            NULL::boolean AS influencer_condition_confirmed,
            NULL AS contract_status,
            NULL AS delivery_status
        FROM public.campaign_applications ca
        JOIN public.campaigns c ON c.id = ca.campaign_id
        JOIN public.profiles inf ON inf.id = ca.influencer_id
        JOIN public.profiles brand ON brand.id = c.brand_id
        WHERE ca.influencer_id IN (
            SELECT user_id FROM public.team_members WHERE team_id = target_team_id AND user_id != caller_id
        )
    ) proposal_row;

    RETURN COALESCE(result, '[]'::json);
END;
$$;

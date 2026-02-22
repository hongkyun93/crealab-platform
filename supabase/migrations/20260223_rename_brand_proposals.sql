-- =====================================================
-- Rename brand_proposals → product_applications
-- 재실행 안전 (idempotent) 버전
-- =====================================================

-- 1. 테이블명 변경 (brand_proposals가 아직 있을 때만)
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'brand_proposals'
    ) THEN
        ALTER TABLE public.brand_proposals RENAME TO product_applications;
    END IF;
END $$;

-- 2. messages: brand_proposal_id → product_application_id (아직 안 바뀐 경우만)
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'brand_proposal_id'
    ) THEN
        ALTER TABLE public.messages RENAME COLUMN brand_proposal_id TO product_application_id;
    END IF;
END $$;

-- 3. messages.product_application_id FK 제약 제거 (FK 위반 409 방지)
--    product_application_id는 proposal_id와 마찬가지로 FK 없는 plain UUID로 운영
DO $$ DECLARE
    fk_name text;
BEGIN
    SELECT tc.constraint_name INTO fk_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'messages'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name IN ('brand_proposal_id', 'product_application_id');

    IF fk_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.messages DROP CONSTRAINT ' || quote_ident(fk_name);
    END IF;
END $$;

-- 4. submission_feedback: brand_proposal_id → product_application_id (아직 안 바뀐 경우만)
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'submission_feedback' AND column_name = 'brand_proposal_id'
    ) THEN
        ALTER TABLE public.submission_feedback RENAME COLUMN brand_proposal_id TO product_application_id;
    END IF;
END $$;

-- 5. submission_feedback FK 제약 제거 (있을 경우)
DO $$ DECLARE
    fk_name text;
BEGIN
    SELECT tc.constraint_name INTO fk_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'submission_feedback'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name IN ('brand_proposal_id', 'product_application_id');

    IF fk_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.submission_feedback DROP CONSTRAINT ' || quote_ident(fk_name);
    END IF;
END $$;

-- 6. workspaces: proposal_type CHECK 제약 교체 (데이터 UPDATE 먼저)
ALTER TABLE public.workspaces
    DROP CONSTRAINT IF EXISTS workspaces_proposal_type_check;

UPDATE public.workspaces
    SET proposal_type = 'product_application'
    WHERE proposal_type = 'brand_proposal';

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = 'workspaces'
          AND constraint_name = 'workspaces_proposal_type_check'
    ) THEN
        ALTER TABLE public.workspaces
            ADD CONSTRAINT workspaces_proposal_type_check
            CHECK (proposal_type IN ('product_application','moment_proposal','campaign_application'));
    END IF;
END $$;

-- 7. MCN RPC 재정의
CREATE OR REPLACE FUNCTION public.get_team_dashboard_summary(target_team_id UUID)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public VOLATILE
AS $$
DECLARE
    caller_id UUID;
    result json;
BEGIN
    caller_id := auth.uid();
    IF caller_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
    IF NOT EXISTS (
        SELECT 1 FROM public.team_members
        WHERE team_id = target_team_id AND user_id = caller_id
    ) THEN RAISE EXCEPTION 'Not a member of this team'; END IF;

    SELECT json_agg(creator_summary) INTO result
    FROM (
        SELECT
            tm.user_id, p.display_name, p.avatar_url, p.instagram_handle,
            p.followers_count, p.tier, p.tags, p.price_video, p.price_feed,
            COALESCE(moment_stats.total_moments, 0) AS total_moments,
            COALESCE(moment_stats.active_moments, 0) AS active_moments,
            COALESCE(pa_stats.total_proposals, 0) AS total_product_applications,
            COALESCE(pa_stats.pending_proposals, 0) AS pending_product_applications,
            COALESCE(pa_stats.active_proposals, 0) AS active_product_applications,
            COALESCE(pa_stats.total_revenue, 0) AS product_revenue,
            COALESCE(mp_stats.total_proposals, 0) AS total_moment_proposals,
            COALESCE(mp_stats.pending_proposals, 0) AS pending_moment_proposals,
            COALESCE(mp_stats.active_proposals, 0) AS active_moment_proposals,
            COALESCE(mp_stats.total_revenue, 0) AS moment_revenue,
            COALESCE(ca_stats.total_applications, 0) AS total_campaign_applications,
            COALESCE(ca_stats.pending_applications, 0) AS pending_campaign_applications,
            COALESCE(ca_stats.active_applications, 0) AS active_campaign_applications
        FROM public.team_members tm
        JOIN public.profiles p ON p.id = tm.user_id
        LEFT JOIN LATERAL (
            SELECT COUNT(*) AS total_moments,
                COUNT(*) FILTER (WHERE lm.status = 'recruiting') AS active_moments
            FROM public.life_moments lm WHERE lm.influencer_id = tm.user_id
        ) moment_stats ON true
        LEFT JOIN LATERAL (
            SELECT COUNT(*) AS total_proposals,
                COUNT(*) FILTER (WHERE pa.status = 'offered') AS pending_proposals,
                COUNT(*) FILTER (WHERE pa.status IN ('accepted','active','in_progress')) AS active_proposals,
                COALESCE(SUM(pa.price_offer) FILTER (WHERE pa.status IN ('accepted','active','in_progress','completed')), 0) AS total_revenue
            FROM public.product_applications pa WHERE pa.influencer_id = tm.user_id
        ) pa_stats ON true
        LEFT JOIN LATERAL (
            SELECT COUNT(*) AS total_proposals,
                COUNT(*) FILTER (WHERE mp.status = 'offered') AS pending_proposals,
                COUNT(*) FILTER (WHERE mp.status IN ('accepted','active','in_progress')) AS active_proposals,
                COALESCE(SUM(mp.price_offer) FILTER (WHERE mp.status IN ('accepted','active','in_progress','completed')), 0) AS total_revenue
            FROM public.moment_proposals mp WHERE mp.influencer_id = tm.user_id
        ) mp_stats ON true
        LEFT JOIN LATERAL (
            SELECT COUNT(*) AS total_applications,
                COUNT(*) FILTER (WHERE ca.status = 'pending') AS pending_applications,
                COUNT(*) FILTER (WHERE ca.status IN ('accepted','active','in_progress')) AS active_applications
            FROM public.campaign_applications ca WHERE ca.influencer_id = tm.user_id
        ) ca_stats ON true
        WHERE tm.team_id = target_team_id AND tm.user_id != caller_id
        ORDER BY p.display_name
    ) creator_summary;

    RETURN COALESCE(result, '[]'::json);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_team_proposals(target_team_id UUID)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public VOLATILE
AS $$
DECLARE
    caller_id UUID;
    result json;
BEGIN
    caller_id := auth.uid();
    IF caller_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
    IF NOT EXISTS (
        SELECT 1 FROM public.team_members
        WHERE team_id = target_team_id AND user_id = caller_id
    ) THEN RAISE EXCEPTION 'Not a member of this team'; END IF;

    SELECT json_agg(proposal_row ORDER BY proposal_row.created_at DESC) INTO result
    FROM (
        SELECT pa.id, 'product_application' AS proposal_type, pa.status,
            pa.product_name, pa.price_offer, pa.message, pa.created_at, pa.influencer_id,
            inf.display_name AS creator_name, inf.avatar_url AS creator_avatar,
            brand.display_name AS brand_name, brand.avatar_url AS brand_avatar,
            pa.content_type, pa.brand_condition_confirmed, pa.influencer_condition_confirmed,
            pa.contract_status, pa.delivery_status
        FROM public.product_applications pa
        JOIN public.profiles inf ON inf.id = pa.influencer_id
        JOIN public.profiles brand ON brand.id = pa.brand_id
        WHERE pa.influencer_id IN (
            SELECT user_id FROM public.team_members WHERE team_id = target_team_id AND user_id != caller_id
        )
        UNION ALL
        SELECT mp.id, 'moment_proposal' AS proposal_type, mp.status,
            mp.product_name, mp.price_offer, mp.message, mp.created_at, mp.influencer_id,
            inf.display_name AS creator_name, inf.avatar_url AS creator_avatar,
            brand.display_name AS brand_name, brand.avatar_url AS brand_avatar,
            mp.content_type, mp.brand_condition_confirmed, mp.influencer_condition_confirmed,
            mp.contract_status, mp.delivery_status
        FROM public.moment_proposals mp
        JOIN public.profiles inf ON inf.id = mp.influencer_id
        JOIN public.profiles brand ON brand.id = mp.brand_id
        WHERE mp.influencer_id IN (
            SELECT user_id FROM public.team_members WHERE team_id = target_team_id AND user_id != caller_id
        )
        UNION ALL
        SELECT ca.id, 'campaign_application' AS proposal_type, ca.status,
            c.product_name, ca.price_offer, ca.message, ca.created_at, ca.influencer_id,
            inf.display_name AS creator_name, inf.avatar_url AS creator_avatar,
            brand.display_name AS brand_name, brand.avatar_url AS brand_avatar,
            NULL AS content_type, NULL::boolean AS brand_condition_confirmed,
            NULL::boolean AS influencer_condition_confirmed, NULL AS contract_status, NULL AS delivery_status
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

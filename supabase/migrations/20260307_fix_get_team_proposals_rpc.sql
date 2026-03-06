-- get_team_proposals RPC 수정
-- 실제 DB 스키마 기준 (2026-03-06 확인):
--   product_applications: id, brand_id, creator_id, product_id, message, status, workspace_id ...
--   moment_proposals:     id, brand_id, creator_id, moment_id,  message, status, workspace_id ...
-- → product_name, price_offer, content_type 등은 workspaces 테이블로 이동됨

CREATE OR REPLACE FUNCTION public.get_team_proposals(target_team_id uuid) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
AS $$
DECLARE caller_id UUID; result json;
BEGIN
  caller_id := auth.uid();
  IF caller_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.team_members WHERE team_id=target_team_id AND user_id=caller_id)
  THEN RAISE EXCEPTION 'Not a member of this team'; END IF;

  SELECT json_agg(row ORDER BY row.created_at DESC) INTO result FROM (
    -- Product Applications (workspace 데이터로 보완)
    SELECT
      pa.id,
      'product_application'::text AS proposal_type,
      COALESCE(w.status, pa.status) AS status,
      COALESCE(w.product_name, '')  AS product_name,
      w.price_offer,
      pa.message,
      pa.created_at,
      pa.updated_at,
      pa.creator_id,
      inf.display_name  AS creator_name,
      inf.avatar_url    AS creator_avatar,
      br.display_name   AS brand_name,
      br.avatar_url     AS brand_avatar,
      w.channel_name    AS content_type,
      w.brand_condition_confirmed,
      w.creator_condition_confirmed,
      w.contract_status,
      w.delivery_status,
      pa.workspace_id
    FROM public.product_applications pa
    JOIN public.profiles inf ON inf.id = pa.creator_id
    JOIN public.profiles br  ON br.id  = pa.brand_id
    LEFT JOIN public.workspaces w ON w.id = pa.workspace_id
    WHERE pa.creator_id IN (
      SELECT user_id FROM public.team_members WHERE team_id=target_team_id AND user_id!=caller_id
    )

    UNION ALL

    -- Moment Proposals (workspace 데이터로 보완)
    SELECT
      mp.id,
      'moment_proposal'::text,
      COALESCE(w.status, mp.status),
      COALESCE(w.product_name, lm.title, ''),
      w.price_offer,
      mp.message,
      mp.created_at,
      mp.updated_at,
      mp.creator_id,
      inf.display_name,
      inf.avatar_url,
      br.display_name,
      br.avatar_url,
      w.channel_name,
      w.brand_condition_confirmed,
      w.creator_condition_confirmed,
      w.contract_status,
      w.delivery_status,
      mp.workspace_id
    FROM public.moment_proposals mp
    JOIN public.profiles inf   ON inf.id = mp.creator_id
    JOIN public.profiles br    ON br.id  = mp.brand_id
    LEFT JOIN public.life_moments lm ON lm.id = mp.moment_id
    LEFT JOIN public.workspaces w    ON w.id  = mp.workspace_id
    WHERE mp.creator_id IN (
      SELECT user_id FROM public.team_members WHERE team_id=target_team_id AND user_id!=caller_id
    )

    UNION ALL

    -- Campaign Applications
    SELECT
      ca.id,
      'campaign_application'::text,
      ca.status,
      c.product_name,
      ca.price_offer,
      ca.message,
      ca.created_at,
      ca.updated_at,
      ca.creator_id,
      inf.display_name,
      inf.avatar_url,
      br.display_name,
      br.avatar_url,
      NULL::text,
      NULL::boolean,
      NULL::boolean,
      NULL::text,
      NULL::text,
      NULL::uuid
    FROM public.campaign_applications ca
    JOIN public.campaigns c  ON c.id  = ca.campaign_id
    JOIN public.profiles inf ON inf.id = ca.creator_id
    JOIN public.profiles br  ON br.id  = c.brand_id
    WHERE ca.creator_id IN (
      SELECT user_id FROM public.team_members WHERE team_id=target_team_id AND user_id!=caller_id
    )
  ) row;

  RETURN COALESCE(result, '[]'::json);
END;
$$;

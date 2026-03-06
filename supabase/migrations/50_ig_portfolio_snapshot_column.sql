-- Migration 50: social_channels에 ig_portfolio_snapshot 컬럼 추가
-- + MCN이 소속 크리에이터의 포트폴리오 스냅샷을 저장할 수 있는 RPC

-- 1. 컬럼 추가
ALTER TABLE public.social_channels
ADD COLUMN IF NOT EXISTS ig_portfolio_snapshot jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS ig_portfolio_updated_at timestamptz DEFAULT NULL;

COMMENT ON COLUMN public.social_channels.ig_portfolio_snapshot IS
'MCN 포트폴리오 자동생성/수정 시 저장되는 IG 데이터 스냅샷 (er, avgReach, avgSaves, posts[], insights[], demographics{})';

-- 2. MCN이 소속 크리에이터의 ig_portfolio_snapshot을 업데이트하는 RPC
-- teams 테이블에는 owner_id 컬럼이 없으며, created_by 또는 team_members.role='owner' 로 오너 확인
CREATE OR REPLACE FUNCTION public.mcn_update_ig_portfolio_snapshot(
    p_creator_user_id uuid,
    p_snapshot jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_caller_id uuid := auth.uid();
    v_is_authorized boolean;
BEGIN
    -- 호출자가 해당 크리에이터와 같은 팀의 MCN 또는 팀 owner인지 확인
    SELECT EXISTS (
        SELECT 1
        FROM team_members tm_creator
        JOIN team_members tm_caller ON tm_caller.team_id = tm_creator.team_id
        JOIN profiles p ON p.id = v_caller_id
        WHERE tm_creator.user_id = p_creator_user_id
          AND tm_caller.user_id = v_caller_id
          AND p.role IN ('mcn', 'admin')
    ) INTO v_is_authorized;

    IF NOT v_is_authorized THEN
        RAISE EXCEPTION 'Access denied: caller is not the MCN of this creator';
    END IF;

    UPDATE public.social_channels
    SET
        ig_portfolio_snapshot = p_snapshot,
        ig_portfolio_updated_at = now()
    WHERE user_id = p_creator_user_id
      AND platform = 'instagram';
END;
$$;

GRANT EXECUTE ON FUNCTION public.mcn_update_ig_portfolio_snapshot(uuid, jsonb) TO authenticated;

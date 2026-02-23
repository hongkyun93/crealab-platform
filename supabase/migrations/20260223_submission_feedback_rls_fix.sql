-- =====================================================
-- submission_feedback RLS 강화
-- Created: 2026-02-23
-- 
-- 기존: auth.uid() IS NOT NULL (로그인한 모든 사용자 열람 가능)
-- 변경: 해당 proposal의 브랜드/크리에이터/소속 MCN 팀원만 열람 가능
-- =====================================================

-- ── 기존 정책 모두 제거 ───────────────────────────────────────────────────────
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'submission_feedback'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.submission_feedback', r.policyname);
    END LOOP;
END $$;


-- ── Helper: proposal 참여자인지 확인 ─────────────────────────────────────────
-- proposal_id(text) 기준으로 brand_id 또는 influencer_id에 해당하는 사용자,
-- 또는 그 influencer가 속한 MCN 팀원이면 true 반환
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

    -- 1) product_applications 에서 찾기
    SELECT brand_id, influencer_id
    INTO   v_brand_id, v_creator_id
    FROM   public.product_applications
    WHERE  id = p_proposal_id
    LIMIT  1;

    -- 2) moment_proposals 에서 찾기 (없으면)
    IF v_brand_id IS NULL THEN
        SELECT brand_id, influencer_id
        INTO   v_brand_id, v_creator_id
        FROM   public.moment_proposals
        WHERE  id = p_proposal_id
        LIMIT  1;
    END IF;

    -- 3) campaign_applications 에서 찾기 (없으면)
    IF v_brand_id IS NULL THEN
        SELECT c.brand_id, ca.influencer_id
        INTO   v_brand_id, v_creator_id
        FROM   public.campaign_applications ca
        JOIN   public.campaigns c ON c.id = ca.campaign_id
        WHERE  ca.id = p_proposal_id
        LIMIT  1;
    END IF;

    -- 직접 당사자면 true
    IF v_uid = v_brand_id OR v_uid = v_creator_id THEN
        RETURN true;
    END IF;

    -- 크리에이터 소속 MCN 팀원인지 확인
    IF v_creator_id IS NOT NULL THEN
        SELECT EXISTS (
            SELECT 1
            FROM   public.team_members tm_mcn
            JOIN   public.team_members tm_creator
              ON   tm_creator.team_id = tm_mcn.team_id
            WHERE  tm_mcn.user_id   = v_uid
              AND  tm_creator.user_id = v_creator_id
        ) INTO v_in_team;
    END IF;

    RETURN v_in_team;
END;
$$;


-- ── 새 RLS 정책 ───────────────────────────────────────────────────────────────

-- SELECT: sender이거나, proposal 당사자(브랜드·크리에이터·소속 MCN)이면 열람 가능
-- NOTE: brand_proposal_id 컬럼은 20260223_rename_brand_proposals.sql에서
--       product_application_id 로 이미 rename됨
CREATE POLICY "submission_feedback_select"
  ON public.submission_feedback FOR SELECT
  USING (
    auth.uid() = sender_id
    OR (
        -- product_application_id 기반 (product_applications FK)
        product_application_id IS NOT NULL
        AND public.can_access_submission_feedback(product_application_id)
    )
    OR (
        -- proposal_id 기반 (moment_proposal, campaign_application 등)
        proposal_id IS NOT NULL
        AND public.can_access_submission_feedback(proposal_id)
    )
  );

-- INSERT: 본인만 작성 가능
CREATE POLICY "submission_feedback_insert"
  ON public.submission_feedback FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- UPDATE: 본인만 수정 가능
CREATE POLICY "submission_feedback_update"
  ON public.submission_feedback FOR UPDATE
  USING (auth.uid() = sender_id);


-- =====================================================
-- G-20: life_moments private RLS 추가
-- Created: 2026-02-23
--
-- 목적: is_private=true 모먼트가 브랜드 discover 화면에서
--       필터링되도록 DB 레벨에서 보장.
--
-- 허용 조건:
--   1. is_private = false (공개 모먼트)
--   2. 본인 모먼트 (influencer_id = auth.uid())
--   3. 소속 MCN/Agency 팀원 (team_members를 통해)
-- =====================================================

-- 기존 SELECT 정책 모두 제거 후 재정의
DROP POLICY IF EXISTS "life_moments_select" ON public.life_moments;
DROP POLICY IF EXISTS "life_moments_select_public" ON public.life_moments;
DROP POLICY IF EXISTS "Influencers can view their own life moments" ON public.life_moments;
DROP POLICY IF EXISTS "Anyone can view public life_moments" ON public.life_moments;

-- 새 SELECT 정책: 공개 OR 본인 OR 소속 팀원 OR admin
CREATE POLICY "life_moments_select"
ON public.life_moments FOR SELECT
USING (
    is_private = false
    OR influencer_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (
        SELECT 1 FROM public.team_members tm_viewer
        JOIN public.team_members tm_owner
            ON tm_owner.team_id = tm_viewer.team_id
        WHERE tm_viewer.user_id = auth.uid()
          AND tm_owner.user_id = life_moments.influencer_id
    )
);

-- INSERT: 본인 또는 admin만
DROP POLICY IF EXISTS "life_moments_insert" ON public.life_moments;
CREATE POLICY "life_moments_insert"
ON public.life_moments FOR INSERT
WITH CHECK (
    influencer_id = auth.uid() OR public.is_admin()
);

-- UPDATE: 본인, 소속 MCN 팀원(owner/admin), admin
DROP POLICY IF EXISTS "life_moments_update" ON public.life_moments;
CREATE POLICY "life_moments_update"
ON public.life_moments FOR UPDATE
USING (
    influencer_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (
        SELECT 1 FROM public.team_members tm_viewer
        JOIN public.team_members tm_owner
            ON tm_owner.team_id = tm_viewer.team_id
        WHERE tm_viewer.user_id = auth.uid()
          AND tm_viewer.role IN ('owner', 'admin')
          AND tm_owner.user_id = life_moments.influencer_id
    )
);

-- DELETE: 본인 또는 admin
DROP POLICY IF EXISTS "life_moments_delete" ON public.life_moments;
CREATE POLICY "life_moments_delete"
ON public.life_moments FOR DELETE
USING (influencer_id = auth.uid() OR public.is_admin());

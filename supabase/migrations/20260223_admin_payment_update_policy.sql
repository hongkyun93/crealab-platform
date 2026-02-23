-- =====================================================
-- Admin Payment Update RLS Policies
-- Created: 2026-02-23
-- Purpose: moment_proposals, campaign_applications에
--          admin UPDATE 정책이 없어서 payment_confirmed_at
--          업데이트가 0 rows로 조용히 실패하던 문제 수정.
-- =====================================================

-- moment_proposals: admin UPDATE (누락됐던 정책)
DROP POLICY IF EXISTS "admin_update_moment_proposals" ON public.moment_proposals;
CREATE POLICY "admin_update_moment_proposals"
  ON public.moment_proposals FOR UPDATE
  USING (public.is_admin());

-- campaign_applications: admin UPDATE (누락됐던 정책)
DROP POLICY IF EXISTS "admin_update_campaign_applications" ON public.campaign_applications;
CREATE POLICY "admin_update_campaign_applications"
  ON public.campaign_applications FOR UPDATE
  USING (public.is_admin());

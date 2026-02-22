-- =====================================================
-- Admin RLS Bypass Policies
-- Created: 2026-02-22
-- Purpose: Allow admin role to read all data in key tables
-- NOTE: Supabase RLS bypasses for service_role, but not for
--       regular users with admin role in profiles table.
--       These policies add SELECT access for admin role.
-- =====================================================

-- Helper: check if current user is admin
-- Uses get_current_user_info RPC or profiles.role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ── life_moments ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admin_read_life_moments" ON public.life_moments;
CREATE POLICY "admin_read_life_moments"
  ON public.life_moments FOR SELECT
  USING (public.is_admin());

-- ── product_applications ───────────────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admin_read_brand_proposals" ON public.product_applications;
DROP POLICY IF EXISTS "admin_update_brand_proposals" ON public.product_applications;
DROP POLICY IF EXISTS "admin_read_product_applications" ON public.product_applications;
DROP POLICY IF EXISTS "admin_update_product_applications" ON public.product_applications;
CREATE POLICY "admin_read_product_applications"
  ON public.product_applications FOR SELECT
  USING (public.is_admin());

CREATE POLICY "admin_update_product_applications"
  ON public.product_applications FOR UPDATE
  USING (public.is_admin());

-- ── moment_proposals ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admin_read_moment_proposals" ON public.moment_proposals;
CREATE POLICY "admin_read_moment_proposals"
  ON public.moment_proposals FOR SELECT
  USING (public.is_admin());

-- ── campaign_applications ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admin_read_campaign_applications" ON public.campaign_applications;
CREATE POLICY "admin_read_campaign_applications"
  ON public.campaign_applications FOR SELECT
  USING (public.is_admin());

-- ── workspaces ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admin_read_workspaces" ON public.workspaces;
CREATE POLICY "admin_read_workspaces"
  ON public.workspaces FOR SELECT
  USING (public.is_admin());

-- ── settlements ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admin_read_settlements" ON public.settlements;
CREATE POLICY "admin_read_settlements"
  ON public.settlements FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "admin_update_settlements" ON public.settlements;
CREATE POLICY "admin_update_settlements"
  ON public.settlements FOR UPDATE
  USING (public.is_admin());

-- ── profiles (for user display names) ────────────────────────────────────────
DROP POLICY IF EXISTS "admin_read_profiles" ON public.profiles;
CREATE POLICY "admin_read_profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

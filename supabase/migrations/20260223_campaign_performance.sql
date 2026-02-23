-- =====================================================
-- campaign_performance 테이블
-- Phase 1 성과 측정 시스템
-- Created: 2026-02-23
-- =====================================================

CREATE TABLE IF NOT EXISTS public.campaign_performance (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,

  -- 연결키: 3종 제안서 테이블 공통
  proposal_type text NOT NULL CHECK (proposal_type IN ('product_application', 'moment_proposal', 'campaign_application')),
  proposal_id text NOT NULL,
  creator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- 인사이트 수치 (AI 추출값)
  views integer,
  likes integer,
  comments integer,
  shares integer,
  saves integer,
  reach integer,

  -- 계산값
  engagement_rate numeric(6,2),
  cpe numeric(10,2),
  cpr numeric(10,2),

  -- 브랜드 선택 입력
  utm_clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  revenue_generated numeric(12,2),

  -- 메타
  screenshot_url text,
  submitted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now() NOT NULL,

  -- proposal당 1개만
  UNIQUE (proposal_type, proposal_id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_campaign_performance_creator ON public.campaign_performance(creator_id);
CREATE INDEX IF NOT EXISTS idx_campaign_performance_brand ON public.campaign_performance(brand_id);
CREATE INDEX IF NOT EXISTS idx_campaign_performance_proposal ON public.campaign_performance(proposal_type, proposal_id);

-- RLS
ALTER TABLE public.campaign_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_performance"
ON public.campaign_performance FOR SELECT
USING (brand_id = auth.uid() OR creator_id = auth.uid() OR public.is_admin());

CREATE POLICY "creator_insert_performance"
ON public.campaign_performance FOR INSERT
WITH CHECK (creator_id = auth.uid());

CREATE POLICY "brand_update_performance"
ON public.campaign_performance FOR UPDATE
USING (brand_id = auth.uid() OR public.is_admin());

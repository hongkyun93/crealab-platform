-- =====================================================================
-- Unified Workspaces Migration
-- Run this in Supabase SQL Editor (Settings > SQL Editor)
-- =====================================================================

-- 1. workspaces 테이블 생성
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES auth.users(id),
    influencer_id UUID NOT NULL REFERENCES auth.users(id),
    proposal_type TEXT NOT NULL CHECK (proposal_type IN ('brand_proposal','moment_proposal','campaign_application')),
    proposal_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 각 proposal 테이블에 workspace_id 추가 (nullable: 기존 데이터 호환)
ALTER TABLE public.brand_proposals
    ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL;

ALTER TABLE public.moment_proposals
    ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL;

ALTER TABLE public.campaign_applications
    ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL;

-- 3. messages에 workspace_id 추가 (FK 없이 — proposal FK 위반 문제 방지)
ALTER TABLE public.messages
    ADD COLUMN IF NOT EXISTS workspace_id UUID;

-- 4. 기존 brand_proposals 데이터 backfill
INSERT INTO public.workspaces (brand_id, influencer_id, proposal_type, proposal_id)
SELECT brand_id, influencer_id, 'brand_proposal', id::text
FROM public.brand_proposals
WHERE workspace_id IS NULL;

UPDATE public.brand_proposals bp
SET workspace_id = w.id
FROM public.workspaces w
WHERE w.proposal_type = 'brand_proposal'
  AND w.proposal_id = bp.id::text
  AND bp.workspace_id IS NULL;

-- 5. 기존 moment_proposals 데이터 backfill
INSERT INTO public.workspaces (brand_id, influencer_id, proposal_type, proposal_id)
SELECT brand_id, influencer_id, 'moment_proposal', id::text
FROM public.moment_proposals
WHERE workspace_id IS NULL;

UPDATE public.moment_proposals mp
SET workspace_id = w.id
FROM public.workspaces w
WHERE w.proposal_type = 'moment_proposal'
  AND w.proposal_id = mp.id::text
  AND mp.workspace_id IS NULL;

-- 6. 기존 campaign_applications 데이터 backfill (brand_id는 campaigns 테이블에서 조인)
INSERT INTO public.workspaces (brand_id, influencer_id, proposal_type, proposal_id)
SELECT c.brand_id, ca.influencer_id, 'campaign_application', ca.id::text
FROM public.campaign_applications ca
JOIN public.campaigns c ON c.id = ca.campaign_id
WHERE ca.workspace_id IS NULL;

UPDATE public.campaign_applications ca
SET workspace_id = w.id
FROM public.workspaces w
WHERE w.proposal_type = 'campaign_application'
  AND w.proposal_id = ca.id::text
  AND ca.workspace_id IS NULL;

-- 7. 기존 messages backfill (brand_proposal_id가 있는 것만 가능)
UPDATE public.messages m
SET workspace_id = bp.workspace_id
FROM public.brand_proposals bp
WHERE m.brand_proposal_id::text = bp.id::text
  AND m.workspace_id IS NULL
  AND bp.workspace_id IS NOT NULL;

-- 8. RLS for workspaces
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace members can view"
ON public.workspaces FOR SELECT
USING (brand_id = auth.uid() OR influencer_id = auth.uid());

CREATE POLICY "workspace members can insert"
ON public.workspaces FOR INSERT
WITH CHECK (brand_id = auth.uid() OR influencer_id = auth.uid());

-- 완료 확인용
SELECT 'workspaces table created' AS status;
SELECT COUNT(*) AS workspace_count FROM public.workspaces;

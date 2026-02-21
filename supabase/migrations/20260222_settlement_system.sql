-- =====================================================
-- Settlement System Migration
-- Created: 2026-02-22
-- Purpose: MCN revenue splits and settlement records
-- =====================================================

-- 1. MCN-Creator revenue split ratios
CREATE TABLE IF NOT EXISTS public.mcn_revenue_splits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  split_ratio numeric(4,3) NOT NULL DEFAULT 0.700 CHECK (split_ratio >= 0 AND split_ratio <= 1),
  -- split_ratio = creator's share (e.g. 0.700 = 70%)
  effective_from date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(team_id, creator_id)
);

-- 2. Settlement records (auto-created when proposal -> completed)
CREATE TABLE IF NOT EXISTS public.settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  creator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  -- Source proposal info
  proposal_type text NOT NULL CHECK (proposal_type IN ('brand_proposal', 'moment_proposal', 'campaign_application')),
  proposal_id text NOT NULL, -- uuid stored as text for polymorphic FK
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE SET NULL,
  -- Financial
  gross_amount integer NOT NULL DEFAULT 0, -- total amount brand paid (price_offer)
  split_ratio numeric(4,3) NOT NULL DEFAULT 0.700,
  creator_amount integer NOT NULL DEFAULT 0, -- gross * split_ratio (rounded)
  mcn_amount integer NOT NULL DEFAULT 0,     -- gross - creator_amount
  -- Status
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'cancelled')),
  paid_at timestamptz,
  -- Grouping
  settlement_month text, -- e.g. '2026-03' for monthly grouping
  -- Meta
  note text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 3. RLS policies
ALTER TABLE public.mcn_revenue_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

-- mcn_revenue_splits: MCN can read/write for their team
CREATE POLICY "mcn_revenue_splits_select" ON public.mcn_revenue_splits
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "mcn_revenue_splits_insert" ON public.mcn_revenue_splits
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "mcn_revenue_splits_update" ON public.mcn_revenue_splits
  FOR UPDATE USING (
    team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- settlements: MCN can read all for their team; creator can read their own
CREATE POLICY "settlements_mcn_select" ON public.settlements
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
    OR creator_id = auth.uid()
  );

CREATE POLICY "settlements_insert" ON public.settlements
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "settlements_update" ON public.settlements
  FOR UPDATE USING (
    team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- 4. Helper RPC: get_team_settlements
-- Returns settlement list + creator name for MCN dashboard
CREATE OR REPLACE FUNCTION public.get_team_settlements(
  target_team_id uuid,
  target_month text DEFAULT NULL -- 'YYYY-MM', NULL = all
)
RETURNS TABLE (
  id uuid,
  creator_id uuid,
  creator_name text,
  creator_avatar text,
  brand_id uuid,
  brand_name text,
  proposal_type text,
  proposal_id text,
  gross_amount integer,
  split_ratio numeric,
  creator_amount integer,
  mcn_amount integer,
  status text,
  paid_at timestamptz,
  settlement_month text,
  note text,
  created_at timestamptz
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.creator_id,
    cp.display_name AS creator_name,
    cp.avatar_url   AS creator_avatar,
    s.brand_id,
    bp.display_name AS brand_name,
    s.proposal_type,
    s.proposal_id,
    s.gross_amount,
    s.split_ratio,
    s.creator_amount,
    s.mcn_amount,
    s.status,
    s.paid_at,
    s.settlement_month,
    s.note,
    s.created_at
  FROM public.settlements s
  LEFT JOIN public.profiles cp ON cp.id = s.creator_id
  LEFT JOIN public.profiles bp ON bp.id = s.brand_id
  WHERE
    s.team_id = target_team_id
    AND (target_month IS NULL OR s.settlement_month = target_month)
  ORDER BY s.created_at DESC;
END;
$$;

-- 5. Helper RPC: upsert_revenue_split
CREATE OR REPLACE FUNCTION public.upsert_revenue_split(
  target_team_id uuid,
  target_creator_id uuid,
  new_ratio numeric
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.mcn_revenue_splits (team_id, creator_id, split_ratio)
  VALUES (target_team_id, target_creator_id, new_ratio)
  ON CONFLICT (team_id, creator_id) DO UPDATE
    SET split_ratio = new_ratio,
        effective_from = CURRENT_DATE;
END;
$$;

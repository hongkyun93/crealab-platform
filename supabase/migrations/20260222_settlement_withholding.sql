-- =====================================================
-- MCN Settlement: Full Migration
-- Created: 2026-02-22
--
-- Part 1: Add withholding tax columns to settlements
-- Part 2: Update get_team_settlements RPC
-- Part 3: Auto-create settlement on proposal completion
-- =====================================================


-- ─── PART 1: Add withholding columns ─────────────────────────────────────────

ALTER TABLE public.settlements
    ADD COLUMN IF NOT EXISTS withholding_rate   numeric(5,4) NOT NULL DEFAULT 0.033,
    ADD COLUMN IF NOT EXISTS withholding_amount integer      NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS net_creator_amount integer      NOT NULL DEFAULT 0;

-- Backfill existing rows
UPDATE public.settlements
SET
    withholding_amount  = ROUND(creator_amount * 0.033),
    net_creator_amount  = creator_amount - ROUND(creator_amount * 0.033)
WHERE withholding_amount = 0;


-- ─── PART 2: Update get_team_settlements RPC ──────────────────────────────────

DROP FUNCTION IF EXISTS public.get_team_settlements(uuid, text);
CREATE OR REPLACE FUNCTION public.get_team_settlements(
  target_team_id uuid,
  target_month   text DEFAULT NULL
)
RETURNS TABLE (
  id                 uuid,
  creator_id         uuid,
  creator_name       text,
  creator_avatar     text,
  brand_id           uuid,
  brand_name         text,
  proposal_type      text,
  proposal_id        text,
  gross_amount       integer,
  split_ratio        numeric,
  creator_amount     integer,
  mcn_amount         integer,
  withholding_rate   numeric,
  withholding_amount integer,
  net_creator_amount integer,
  status             text,
  paid_at            timestamptz,
  settlement_month   text,
  note               text,
  created_at         timestamptz
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.creator_id,
    cp.display_name  AS creator_name,
    cp.avatar_url    AS creator_avatar,
    s.brand_id,
    bp.display_name  AS brand_name,
    s.proposal_type,
    s.proposal_id,
    s.gross_amount,
    s.split_ratio,
    s.creator_amount,
    s.mcn_amount,
    s.withholding_rate,
    s.withholding_amount,
    s.net_creator_amount,
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


-- ─── PART 3: Auto-create settlement on proposal → completed ──────────────────

CREATE OR REPLACE FUNCTION public.fn_auto_create_settlement()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_creator_id    uuid;
  v_brand_id      uuid;
  v_price_offer   integer;
  v_team_id       uuid;
  v_split_ratio   numeric(4,3);
  v_gross         integer;
  v_creator_amt   integer;
  v_mcn_amt       integer;
  v_withhold_rate numeric(5,4) := 0.033;
  v_withhold_amt  integer;
  v_net_amt       integer;
  v_prop_type     text;
  v_prop_id       text;
  v_month         text;
BEGIN
  -- Only fire when status transitions TO 'completed'
  IF NEW.status != 'completed' OR OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  -- ── Resolve per-table fields ──────────────────────────────────────────────
  IF TG_TABLE_NAME = 'product_applications' THEN
    v_creator_id  := NEW.influencer_id;
    v_brand_id    := NEW.brand_id;
    v_price_offer := COALESCE(NEW.price_offer, 0);
    v_prop_type   := 'product_application';
    v_prop_id     := NEW.id::text;

  ELSIF TG_TABLE_NAME = 'moment_proposals' THEN
    v_creator_id  := NEW.influencer_id;
    v_brand_id    := NEW.brand_id;
    v_price_offer := COALESCE(NEW.price_offer, 0);
    v_prop_type   := 'moment_proposal';
    v_prop_id     := NEW.id::text;

  ELSIF TG_TABLE_NAME = 'campaign_applications' THEN
    v_creator_id  := NEW.influencer_id;
    v_price_offer := COALESCE(NEW.price_offer, 0);
    v_prop_type   := 'campaign_application';
    v_prop_id     := NEW.id::text;
    SELECT brand_id INTO v_brand_id
    FROM public.campaigns WHERE id = NEW.campaign_id;
  END IF;

  -- Skip if no price
  IF v_price_offer <= 0 THEN RETURN NEW; END IF;

  -- Skip if settlement already exists for this proposal
  IF EXISTS (
    SELECT 1 FROM public.settlements
    WHERE proposal_type = v_prop_type AND proposal_id = v_prop_id
  ) THEN RETURN NEW; END IF;

  -- ── Find creator's MCN team ───────────────────────────────────────────────
  -- team_members.role CHECK: ('owner', 'admin', 'member') — 'creator' does NOT exist
  -- Find team where: creator is a non-owner member AND team owner has profiles.role = 'mcn'
  SELECT tm.team_id INTO v_team_id
  FROM public.team_members tm
  JOIN public.team_members owner_tm
    ON owner_tm.team_id = tm.team_id AND owner_tm.role = 'owner'
  JOIN public.profiles owner_p
    ON owner_p.id = owner_tm.user_id AND owner_p.role = 'mcn'
  WHERE tm.user_id = v_creator_id
    AND tm.role != 'owner'
  LIMIT 1;

  -- No MCN team → skip
  IF v_team_id IS NULL THEN RETURN NEW; END IF;

  -- ── Get split ratio (default 70%) ─────────────────────────────────────────
  SELECT split_ratio INTO v_split_ratio
  FROM public.mcn_revenue_splits
  WHERE team_id = v_team_id AND creator_id = v_creator_id;

  IF v_split_ratio IS NULL THEN v_split_ratio := 0.700; END IF;

  -- ── Calculate amounts ──────────────────────────────────────────────────────
  v_gross        := v_price_offer;
  v_creator_amt  := ROUND(v_gross * v_split_ratio);
  v_mcn_amt      := v_gross - v_creator_amt;
  v_withhold_amt := ROUND(v_creator_amt * v_withhold_rate);
  v_net_amt      := v_creator_amt - v_withhold_amt;
  v_month        := TO_CHAR(NOW(), 'YYYY-MM');

  -- ── Insert settlement ──────────────────────────────────────────────────────
  INSERT INTO public.settlements (
    team_id, creator_id, brand_id,
    proposal_type, proposal_id,
    gross_amount, split_ratio, creator_amount, mcn_amount,
    withholding_rate, withholding_amount, net_creator_amount,
    status, settlement_month
  ) VALUES (
    v_team_id, v_creator_id, v_brand_id,
    v_prop_type, v_prop_id,
    v_gross, v_split_ratio, v_creator_amt, v_mcn_amt,
    v_withhold_rate, v_withhold_amt, v_net_amt,
    'pending', v_month
  );

  RETURN NEW;
END;
$$;

-- Triggers
DROP TRIGGER IF EXISTS trg_settlement_on_product_application_complete ON public.product_applications;
DROP TRIGGER IF EXISTS trg_settlement_on_brand_proposal_complete      ON public.product_applications;
DROP TRIGGER IF EXISTS trg_settlement_on_moment_proposal_complete     ON public.moment_proposals;
DROP TRIGGER IF EXISTS trg_settlement_on_campaign_app_complete        ON public.campaign_applications;

CREATE TRIGGER trg_settlement_on_product_application_complete
AFTER UPDATE OF status ON public.product_applications
FOR EACH ROW EXECUTE FUNCTION public.fn_auto_create_settlement();

CREATE TRIGGER trg_settlement_on_moment_proposal_complete
AFTER UPDATE OF status ON public.moment_proposals
FOR EACH ROW EXECUTE FUNCTION public.fn_auto_create_settlement();

CREATE TRIGGER trg_settlement_on_campaign_app_complete
AFTER UPDATE OF status ON public.campaign_applications
FOR EACH ROW EXECUTE FUNCTION public.fn_auto_create_settlement();

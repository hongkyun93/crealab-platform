-- Migration: Escrow Settlement System (V22)
-- Adding 'escrow', 'void' statuses, 'tax_invoice_status' column, and Unified Lifecycle Triggers.

-- 1. Alter settlements table
ALTER TABLE public.settlements DROP CONSTRAINT IF EXISTS settlements_status_check;

ALTER TABLE public.settlements ADD CONSTRAINT settlements_status_check
CHECK ((status = ANY (ARRAY['escrow'::text, 'pending'::text, 'processing'::text, 'paid'::text, 'cancelled'::text, 'void'::text])));

ALTER TABLE public.settlements ADD COLUMN IF NOT EXISTS tax_invoice_status text DEFAULT NULL;
ALTER TABLE public.settlements ADD COLUMN IF NOT EXISTS tax_invoice_requested_at timestamp with time zone;

-- 2. Unified settlement lifecycle trigger function
CREATE OR REPLACE FUNCTION public.fn_handle_settlement_lifecycle()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
AS $$
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
  v_current_bal   integer;
BEGIN
  IF TG_TABLE_NAME = 'product_applications' THEN
    v_creator_id  := NEW.creator_id;
    v_brand_id    := NEW.brand_id;
    v_price_offer := COALESCE(NEW.price_offer, 0);
    v_prop_type   := 'product_application';
    v_prop_id     := NEW.id::text;
  ELSIF TG_TABLE_NAME = 'moment_proposals' THEN
    v_creator_id  := NEW.creator_id;
    v_brand_id    := NEW.brand_id;
    v_price_offer := COALESCE(NEW.price_offer, 0);
    v_prop_type   := 'moment_proposal';
    v_prop_id     := NEW.id::text;
  ELSIF TG_TABLE_NAME = 'campaign_applications' THEN
    v_creator_id  := NEW.creator_id;
    v_brand_id    := (SELECT brand_id FROM public.campaigns WHERE id = NEW.campaign_id LIMIT 1);
    v_price_offer := COALESCE(NEW.price_offer, 0);
    v_prop_type   := 'campaign_application';
    v_prop_id     := NEW.id::text;
  ELSE
    RETURN NEW;
  END IF;

  v_gross := v_price_offer;

  -- 1. Payment Confirmed -> Create Escrow
  IF NEW.payment_confirmed_at IS NOT NULL AND OLD.payment_confirmed_at IS NULL THEN
      IF v_price_offer > 0 THEN
          SELECT team_id INTO v_team_id FROM public.profiles WHERE id = v_creator_id;
          IF v_team_id IS NOT NULL THEN
            SELECT split_ratio INTO v_split_ratio FROM public.mcn_revenue_splits WHERE team_id = v_team_id AND creator_id = v_creator_id;
            IF NOT FOUND THEN v_split_ratio := 0.700; END IF;
          ELSE
            v_split_ratio := 1.000;
          END IF;

          v_creator_amt := ROUND(v_gross * v_split_ratio);
          v_mcn_amt     := v_gross - v_creator_amt;
          v_withhold_amt:= ROUND(v_creator_amt * v_withhold_rate);
          v_net_amt     := v_creator_amt - v_withhold_amt;
          v_month       := TO_CHAR(NOW(), 'YYYY-MM');

          -- Avoid double insertion!
          IF NOT EXISTS (SELECT 1 FROM public.settlements WHERE proposal_id = v_prop_id AND proposal_type = v_prop_type AND status != 'void') THEN
              INSERT INTO public.settlements (
                team_id, creator_id, brand_id, workspace_id,
                proposal_type, proposal_id,
                gross_amount, split_ratio,
                creator_amount, mcn_amount,
                withholding_rate, withholding_amount,
                net_creator_amount, settlement_month, status
              ) VALUES (
                v_team_id, v_creator_id, v_brand_id, NEW.workspace_id,
                v_prop_type, v_prop_id,
                v_gross, v_split_ratio,
                v_creator_amt, v_mcn_amt,
                v_withhold_rate, v_withhold_amt,
                v_net_amt, v_month, 'escrow'
              );
          END IF;
      END IF;
  END IF;

  -- 2. Status Completed -> Transition Escrow to Pending (Or create if missing)
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
      UPDATE public.settlements
      SET status = 'pending', updated_at = NOW()
      WHERE proposal_id = v_prop_id AND proposal_type = v_prop_type AND status = 'escrow';

      -- Fallback: If escrow doesn't exist (legacy complete without tracking payment), create pending
      IF NOT FOUND AND v_price_offer > 0 THEN
          SELECT team_id INTO v_team_id FROM public.profiles WHERE id = v_creator_id;
          IF v_team_id IS NOT NULL THEN
            SELECT split_ratio INTO v_split_ratio FROM public.mcn_revenue_splits WHERE team_id = v_team_id AND creator_id = v_creator_id;
            IF NOT FOUND THEN v_split_ratio := 0.700; END IF;
          ELSE
            v_split_ratio := 1.000;
          END IF;

          v_creator_amt := ROUND(v_gross * v_split_ratio);
          v_mcn_amt     := v_gross - v_creator_amt;
          v_withhold_amt:= ROUND(v_creator_amt * v_withhold_rate);
          v_net_amt     := v_creator_amt - v_withhold_amt;
          v_month       := TO_CHAR(NOW(), 'YYYY-MM');

          IF NOT EXISTS (SELECT 1 FROM public.settlements WHERE proposal_id = v_prop_id AND proposal_type = v_prop_type AND status != 'void') THEN
              INSERT INTO public.settlements (
                team_id, creator_id, brand_id, workspace_id,
                proposal_type, proposal_id,
                gross_amount, split_ratio,
                creator_amount, mcn_amount,
                withholding_rate, withholding_amount,
                net_creator_amount, settlement_month, status
              ) VALUES (
                v_team_id, v_creator_id, v_brand_id, NEW.workspace_id,
                v_prop_type, v_prop_id,
                v_gross, v_split_ratio,
                v_creator_amt, v_mcn_amt,
                v_withhold_rate, v_withhold_amt,
                v_net_amt, v_month, 'pending'
              );
          END IF;
      END IF;
  END IF;

  -- 3. Status Canceled -> Auto-Refund Escrow
  IF NEW.status = 'canceled' AND OLD.status != 'canceled' THEN
      IF EXISTS (SELECT 1 FROM public.settlements WHERE proposal_id = v_prop_id AND proposal_type = v_prop_type AND status = 'escrow') THEN
          UPDATE public.settlements
          SET status = 'void', updated_at = NOW()
          WHERE proposal_id = v_prop_id AND proposal_type = v_prop_type AND status = 'escrow';

          SELECT COALESCE(deposit_balance, 0) INTO v_current_bal FROM public.profiles WHERE id = v_brand_id;
          
          UPDATE public.profiles
          SET deposit_balance = v_current_bal + v_gross
          WHERE id = v_brand_id;

          INSERT INTO public.brand_deposits (
              brand_id, type, amount, balance_after,
              reference_id, reference_type, note,
              status, confirmed_at
          ) VALUES (
              v_brand_id, 'refund', v_gross, v_current_bal + v_gross,
              COALESCE(NEW.workspace_id, NEW.id)::uuid, v_prop_type,
              '협업 취소에 따른 정산금 환불 (' || v_prop_type || ')',
              'confirmed', NOW()
          );
      END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 3. Replace Old Triggers
DROP TRIGGER IF EXISTS trg_settlement_on_product_application_complete ON public.product_applications;
CREATE TRIGGER trg_settlement_lifecycle_on_product_app
  AFTER UPDATE OF status, payment_confirmed_at ON public.product_applications
  FOR EACH ROW EXECUTE FUNCTION public.fn_handle_settlement_lifecycle();

DROP TRIGGER IF EXISTS trg_settlement_on_moment_proposal_complete ON public.moment_proposals;
CREATE TRIGGER trg_settlement_lifecycle_on_moment_proposal
  AFTER UPDATE OF status, payment_confirmed_at ON public.moment_proposals
  FOR EACH ROW EXECUTE FUNCTION public.fn_handle_settlement_lifecycle();

DROP TRIGGER IF EXISTS trg_settlement_on_campaign_app_complete ON public.campaign_applications;
CREATE TRIGGER trg_settlement_lifecycle_on_campaign_app
  AFTER UPDATE OF status, payment_confirmed_at ON public.campaign_applications
  FOR EACH ROW EXECUTE FUNCTION public.fn_handle_settlement_lifecycle();

-- 4. Update MCN Settlements RPC
DROP FUNCTION IF EXISTS public.get_team_settlements(uuid, text);

CREATE OR REPLACE FUNCTION public.get_team_settlements(target_team_id uuid, target_month text DEFAULT NULL::text) RETURNS TABLE(id uuid, creator_id uuid, creator_name text, creator_avatar text, brand_id uuid, brand_name text, proposal_type text, proposal_id text, gross_amount integer, split_ratio numeric, creator_amount integer, mcn_amount integer, withholding_rate numeric, withholding_amount integer, net_creator_amount integer, status text, paid_at timestamp with time zone, final_completed_at timestamp with time zone, settlement_month text, statement_number text, note text, created_at timestamp with time zone, tax_invoice_status text, tax_invoice_requested_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.creator_id,
    cp.display_name    AS creator_name,
    cp.avatar_url      AS creator_avatar,
    s.brand_id,
    bp.display_name    AS brand_name,
    s.proposal_type,
    s.proposal_id,
    s.gross_amount,
    s.split_ratio,
    s.creator_amount,
    s.mcn_amount,
    COALESCE(s.withholding_rate, 0.033)                                    AS withholding_rate,
    COALESCE(s.withholding_amount, ROUND(s.creator_amount * 0.033)::int)   AS withholding_amount,
    COALESCE(s.net_creator_amount, s.creator_amount - ROUND(s.creator_amount * 0.033)::int) AS net_creator_amount,
    s.status,
    s.paid_at,
    s.final_completed_at,
    s.settlement_month,
    s.statement_number,
    s.note,
    s.created_at,
    s.tax_invoice_status,
    s.tax_invoice_requested_at
  FROM public.settlements s
  LEFT JOIN public.profiles cp ON cp.id = s.creator_id
  LEFT JOIN public.profiles bp ON bp.id = s.brand_id
  WHERE
    s.team_id = target_team_id
    AND (target_month IS NULL OR s.settlement_month = target_month)
  ORDER BY s.created_at DESC;
END;
$$;

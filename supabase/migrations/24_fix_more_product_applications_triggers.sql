-- 1. Update fn_handle_settlement_lifecycle
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
    v_price_offer := COALESCE(NULLIF(regexp_replace(NEW.compensation_amount, '[^0-9]', '', 'g'), ''), '0')::integer;
    v_prop_type   := 'product_application';
    v_prop_id     := NEW.id::text;
  ELSIF TG_TABLE_NAME = 'moment_proposals' THEN
    v_creator_id  := NEW.creator_id;
    v_brand_id    := NEW.brand_id;
    v_price_offer := COALESCE(NULLIF(regexp_replace(NEW.conditions->>'price_offer', '[^0-9]', '', 'g'), ''), '0')::integer;
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
          SELECT tm.team_id INTO v_team_id
          FROM public.team_members tm
          JOIN public.team_members owner_tm ON owner_tm.team_id=tm.team_id AND owner_tm.role='owner'
          JOIN public.profiles owner_p ON owner_p.id=owner_tm.user_id AND owner_p.role='mcn'
          WHERE tm.user_id=v_creator_id AND tm.role != 'owner' LIMIT 1;

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
          SELECT tm.team_id INTO v_team_id
          FROM public.team_members tm
          JOIN public.team_members owner_tm ON owner_tm.team_id=tm.team_id AND owner_tm.role='owner'
          JOIN public.profiles owner_p ON owner_p.id=owner_tm.user_id AND owner_p.role='mcn'
          WHERE tm.user_id=v_creator_id AND tm.role != 'owner' LIMIT 1;

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

-- 2. Update fn_auto_create_settlement
CREATE OR REPLACE FUNCTION public.fn_auto_create_settlement() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
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
BEGIN
  IF NEW.status != 'completed' OR OLD.status = 'completed' THEN RETURN NEW; END IF;

  IF TG_TABLE_NAME = 'product_applications' THEN
    v_creator_id  := NEW.creator_id;
    v_brand_id    := NEW.brand_id;
    v_price_offer := COALESCE(NULLIF(regexp_replace(NEW.compensation_amount, '[^0-9]', '', 'g'), ''), '0')::integer;
    v_prop_type   := 'product_application';
    v_prop_id     := NEW.id::text;
  ELSIF TG_TABLE_NAME = 'moment_proposals' THEN
    v_creator_id  := NEW.creator_id;
    v_brand_id    := NEW.brand_id;
    v_price_offer := COALESCE(NULLIF(regexp_replace(NEW.conditions->>'price_offer', '[^0-9]', '', 'g'), ''), '0')::integer;
    v_prop_type   := 'moment_proposal';
    v_prop_id     := NEW.id::text;
  ELSIF TG_TABLE_NAME = 'campaign_applications' THEN
    v_creator_id  := NEW.creator_id;
    v_price_offer := COALESCE(NEW.price_offer, 0);
    v_prop_type   := 'campaign_application';
    v_prop_id     := NEW.id::text;
    SELECT brand_id INTO v_brand_id FROM public.campaigns WHERE id = NEW.campaign_id;
  END IF;

  IF v_price_offer <= 0 THEN RETURN NEW; END IF;
  IF EXISTS (SELECT 1 FROM public.settlements WHERE proposal_type=v_prop_type AND proposal_id=v_prop_id) THEN RETURN NEW; END IF;

  SELECT tm.team_id INTO v_team_id
  FROM public.team_members tm
  JOIN public.team_members owner_tm ON owner_tm.team_id=tm.team_id AND owner_tm.role='owner'
  JOIN public.profiles owner_p ON owner_p.id=owner_tm.user_id AND owner_p.role='mcn'
  WHERE tm.user_id=v_creator_id AND tm.role != 'owner' LIMIT 1;

  IF v_team_id IS NULL THEN RETURN NEW; END IF;

  SELECT split_ratio INTO v_split_ratio FROM public.mcn_revenue_splits WHERE team_id=v_team_id AND creator_id=v_creator_id;
  IF v_split_ratio IS NULL THEN v_split_ratio := 0.700; END IF;

  v_gross        := v_price_offer;
  v_creator_amt  := ROUND(v_gross * v_split_ratio);
  v_mcn_amt      := v_gross - v_creator_amt;
  v_withhold_amt := ROUND(v_creator_amt * v_withhold_rate);
  v_net_amt      := v_creator_amt - v_withhold_amt;
  v_month        := TO_CHAR(NOW(), 'YYYY-MM');

  INSERT INTO public.settlements (
    team_id, creator_id, brand_id, proposal_type, proposal_id,
    gross_amount, split_ratio, creator_amount, mcn_amount,
    withholding_rate, withholding_amount, net_creator_amount, status, settlement_month
  ) VALUES (
    v_team_id, v_creator_id, v_brand_id, v_prop_type, v_prop_id,
    v_gross, v_split_ratio, v_creator_amt, v_mcn_amt,
    v_withhold_rate, v_withhold_amt, v_net_amt, 'pending', v_month
  );

  RETURN NEW;
END;
$$;

-- 3. Update fn_deduct_deposit_on_contract_signed
CREATE OR REPLACE FUNCTION public.fn_deduct_deposit_on_contract_signed() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_brand_id    uuid;
    v_amount      integer;
    v_prop_label  text;
    v_prop_id     text;
    v_balance     integer;
BEGIN
    -- contract_status가 'signed'로 바뀔 때만 실행
    IF NEW.contract_status != 'signed' OR OLD.contract_status = 'signed' THEN
        RETURN NEW;
    END IF;

    -- 테이블별 필드 매핑
    v_brand_id   := NEW.brand_id;
    v_prop_id    := NEW.id::text;

    IF TG_TABLE_NAME = 'product_applications' THEN
        v_prop_label := 'product_application';
        v_amount     := COALESCE(NULLIF(regexp_replace(NEW.compensation_amount, '[^0-9]', '', 'g'), ''), '0')::integer;
    ELSIF TG_TABLE_NAME = 'moment_proposals' THEN
        v_prop_label := 'moment_proposal';
        v_amount     := COALESCE(NULLIF(regexp_replace(NEW.conditions->>'price_offer', '[^0-9]', '', 'g'), ''), '0')::integer;
    ELSIF TG_TABLE_NAME = 'campaign_applications' THEN
        -- campaign_applications는 brand_id가 campaigns 테이블에 있음
        SELECT c.brand_id INTO v_brand_id
        FROM public.campaigns c WHERE c.id = NEW.campaign_id;
        v_prop_label := 'campaign_application';
        v_amount     := COALESCE(NEW.price_offer, 0);
    END IF;

    -- price_offer가 0이면 차감 불필요
    IF v_amount <= 0 OR v_brand_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- 중복 차감 방지: 이미 'use' 레코드가 있으면 스킵
    IF EXISTS (
        SELECT 1 FROM public.brand_deposits 
        WHERE brand_id = v_brand_id
          AND reference_id = COALESCE(NEW.workspace_id, NEW.id)::uuid
          AND type = 'use'
          AND status = 'confirmed'
    ) THEN
        RETURN NEW;
    END IF;

    -- 브랜드 잔액 확인 (부족하면 에러 던짐)
    SELECT COALESCE(deposit_balance, 0) INTO v_balance
    FROM public.profiles WHERE id = v_brand_id FOR UPDATE;

    IF v_balance < v_amount THEN
        RAISE EXCEPTION 'Insufficient deposit balance (Brand:% bal:% amt:%)', v_brand_id, v_balance, v_amount;
    END IF;

    -- 1. 잔액 차감 업데이트
    UPDATE public.profiles
    SET deposit_balance = v_balance - v_amount
    WHERE id = v_brand_id;

    -- 2. 내역 기록 반영
    INSERT INTO public.brand_deposits (
        brand_id, type, amount, balance_after,
        reference_id, reference_type, note,
        status, confirmed_at
    ) VALUES (
        v_brand_id, 'use', v_amount, v_balance - v_amount,
        COALESCE(NEW.workspace_id, NEW.id)::uuid, v_prop_label,
        '전자 계약서 승인으로 인한 예치금 자동 차감 (' || v_prop_label || ')',
        'confirmed', NOW()
    );

    RETURN NEW;
END;
$$;

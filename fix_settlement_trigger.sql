CREATE OR REPLACE FUNCTION public.fn_auto_create_settlement()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
  IF NEW.status != 'completed' OR (OLD.status IS NOT DISTINCT FROM NEW.status) THEN RETURN NEW; END IF;

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

  -- 2. Validate price
  IF v_price_offer <= 0 THEN RETURN NEW; END IF;
  v_gross := v_price_offer;

  -- 3. MCN Team resolving
  SELECT team_id INTO v_team_id FROM public.profiles WHERE id = v_creator_id;

  -- 4. Split Ratio
  IF v_team_id IS NOT NULL THEN
    SELECT split_ratio INTO v_split_ratio
    FROM public.mcn_revenue_splits
    WHERE team_id = v_team_id AND creator_id = v_creator_id;

    IF NOT FOUND THEN v_split_ratio := 0.700; END IF;
  ELSE
    v_split_ratio := 1.000;
  END IF;

  -- 5. Calculate amounts
  v_creator_amt := ROUND(v_gross * v_split_ratio);
  v_mcn_amt     := v_gross - v_creator_amt;
  v_withhold_amt:= ROUND(v_creator_amt * v_withhold_rate);
  v_net_amt     := v_creator_amt - v_withhold_amt;
  v_month       := TO_CHAR(NOW(), 'YYYY-MM');

  -- 6. Insert into settlements
  INSERT INTO public.settlements (
    team_id, creator_id, brand_id, workspace_id,
    proposal_type, proposal_id,
    gross_amount, split_ratio,
    creator_amount, mcn_amount,
    withholding_rate, withholding_amount,
    net_creator_amount, settlement_month, status
  )
  VALUES (
    v_team_id, v_creator_id, v_brand_id, NEW.workspace_id,
    v_prop_type, v_prop_id,
    v_gross, v_split_ratio,
    v_creator_amt, v_mcn_amt,
    v_withhold_rate, v_withhold_amt,
    v_net_amt, v_month, 'pending'
  );

  RETURN NEW;
END;
$function$;

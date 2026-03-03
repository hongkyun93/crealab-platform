-- Migration 26: Fix Race Condition in brand_pay_from_deposit
-- Solution: Add SELECT FOR UPDATE for deposit balance lock & double-payment check

CREATE OR REPLACE FUNCTION public.brand_pay_from_deposit(
    p_proposal_id    text,
    p_proposal_type  text,   -- 'product_application' | 'moment_proposal' | 'campaign_application'
    p_amount         integer, -- VAT 포함 총액
    p_product_name   text DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_brand_id           uuid;
    v_current_bal        integer;
    v_new_bal            integer;
    v_table              text;
    v_creator_id         uuid;
    v_workspace_id       text;
    v_payment_confirmed  timestamp with time zone;
BEGIN
    -- 1. Determine target table based on proposal type
    v_table := CASE p_proposal_type
        WHEN 'product_application'   THEN 'product_applications'
        WHEN 'moment_proposal'       THEN 'moment_proposals'
        WHEN 'campaign_application'  THEN 'campaign_applications'
        ELSE 'product_applications'
    END;

    -- 2. Fetch proposal data AND check if payment is already confirmed
    EXECUTE format(
        'SELECT brand_id, creator_id, workspace_id::text, payment_confirmed_at FROM public.%I WHERE id = $1',
        v_table
    ) INTO v_brand_id, v_creator_id, v_workspace_id, v_payment_confirmed
    USING p_proposal_id::uuid;

    -- 3. Authorization check
    IF v_brand_id IS NULL OR v_brand_id != auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized: caller is not the brand of this proposal';
    END IF;

    -- 4. Double-payment prevention
    IF v_payment_confirmed IS NOT NULL THEN
        RAISE EXCEPTION 'Payment already processed for this proposal (id: %)', p_proposal_id;
    END IF;

    -- 5. Lock the brand's profile row to prevent concurrent balance deductions
    --    This blocks other simultaneous calls to this function for the same brand until this transaction completes.
    SELECT COALESCE(deposit_balance, 0) INTO v_current_bal
    FROM public.profiles 
    WHERE id = v_brand_id
    FOR UPDATE;

    -- 6. Check balance sufficiency
    IF v_current_bal < p_amount THEN
        RAISE EXCEPTION 'Insufficient deposit balance: % < %', v_current_bal, p_amount;
    END IF;

    v_new_bal := v_current_bal - p_amount;

    -- 7. Insert deposit usage record (brand_deposits)
    INSERT INTO public.brand_deposits (
        brand_id, type, amount, balance_after,
        reference_id, reference_type, note,
        status, confirmed_at
    ) VALUES (
        v_brand_id, 'use', p_amount, v_new_bal,
        COALESCE(v_workspace_id, p_proposal_id)::uuid, p_proposal_type,
        '워크스페이스 광고비 자동 차감 (' || p_product_name || ')',
        'confirmed', NOW()
    );

    -- 8. Deduct deposit balance (profiles)
    UPDATE public.profiles
    SET deposit_balance = v_new_bal
    WHERE id = v_brand_id;

    -- 9. Set payment_confirmed_at on the proposal
    EXECUTE format(
        'UPDATE public.%I SET payment_confirmed_at = NOW() WHERE id = $1',
        v_table
    ) USING p_proposal_id::uuid;

    -- 10. Set payment_confirmed_at on the workspace (if exists)
    IF v_workspace_id IS NOT NULL THEN
        UPDATE public.workspaces
        SET payment_confirmed_at = NOW()
        WHERE id = v_workspace_id::uuid;
    END IF;
END;
$$;

-- Grant execution permission
GRANT EXECUTE ON FUNCTION public.brand_pay_from_deposit(text, text, integer, text) TO authenticated;

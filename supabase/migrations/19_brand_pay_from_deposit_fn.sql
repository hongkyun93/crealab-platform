-- Migration: SECURITY DEFINER function for brand deposit payment
-- Fixes: handlePayFromDeposit fails with {} (profiles.deposit_balance RLS blocked)
-- Solution: Single atomic function that bypasses RLS, only callable by the brand themselves

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
    v_brand_id      uuid;
    v_current_bal   integer;
    v_new_bal       integer;
    v_table         text;
    v_creator_id    uuid;
    v_workspace_id  text;
BEGIN
    -- 호출자가 해당 proposal의 brand_id인지 검증
    v_table := CASE p_proposal_type
        WHEN 'product_application'  THEN 'product_applications'
        WHEN 'moment_proposal'       THEN 'moment_proposals'
        WHEN 'campaign_application'  THEN 'campaign_applications'
        ELSE 'product_applications'
    END;

    -- brand_id, creator_id, workspace_id 조회
    EXECUTE format(
        'SELECT brand_id, creator_id, workspace_id::text FROM public.%I WHERE id = $1',
        v_table
    ) INTO v_brand_id, v_creator_id, v_workspace_id
    USING p_proposal_id::uuid;

    IF v_brand_id IS NULL OR v_brand_id != auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized: caller is not the brand of this proposal';
    END IF;

    -- 현재 잔액 조회
    SELECT COALESCE(deposit_balance, 0) INTO v_current_bal
    FROM public.profiles WHERE id = v_brand_id;

    IF v_current_bal < p_amount THEN
        RAISE EXCEPTION 'Insufficient deposit balance: % < %', v_current_bal, p_amount;
    END IF;

    v_new_bal := v_current_bal - p_amount;

    -- 1. brand_deposits 거래 내역 삽입 (reference_id = workspace_id → 워크스페이스 관리번호와 일치)
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

    -- 2. profiles.deposit_balance 차감 (RLS bypass)
    UPDATE public.profiles
    SET deposit_balance = v_new_bal
    WHERE id = v_brand_id;

    -- 3. proposal payment_confirmed_at 세팅
    EXECUTE format(
        'UPDATE public.%I SET payment_confirmed_at = NOW() WHERE id = $1',
        v_table
    ) USING p_proposal_id::uuid;

    -- 4. workspaces.payment_confirmed_at 세팅 (리프레시 후에도 유지 — workspaces 테이블이 UI의 단일 진실 소스)
    IF v_workspace_id IS NOT NULL THEN
        UPDATE public.workspaces
        SET payment_confirmed_at = NOW()
        WHERE id = v_workspace_id::uuid;
    END IF;
END;
$$;

-- authenticated 유저 실행 권한 (내부에서 auth.uid() == brand_id 검증)
GRANT EXECUTE ON FUNCTION public.brand_pay_from_deposit(text, text, integer, text)
    TO authenticated;

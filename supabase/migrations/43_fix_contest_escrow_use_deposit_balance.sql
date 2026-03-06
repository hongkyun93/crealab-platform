-- Fix create_contest_escrow to use profiles.deposit_balance instead of billing_history
-- billing_history는 광고비 입금 확인용이고, 실제 예치금은 profiles.deposit_balance에 있음

CREATE OR REPLACE FUNCTION create_contest_escrow(
    p_contest_id UUID,
    p_brand_id UUID,
    p_total_amount INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_deposit_balance INTEGER;
    v_contest RECORD;
    v_new_balance INTEGER;
BEGIN
    -- 콘테스트 존재 및 브랜드 소유 확인
    SELECT * INTO v_contest FROM public.ad_contests 
    WHERE id = p_contest_id AND brand_id = p_brand_id AND status = 'draft';
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid contest, brand, or status.');
    END IF;

    -- 브랜드 예치금 잔액 조회
    SELECT COALESCE(deposit_balance, 0) INTO v_deposit_balance
    FROM public.profiles
    WHERE id = p_brand_id;

    -- 잔액 충분한지 확인
    IF v_deposit_balance < p_total_amount THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'Insufficient balance.',
            'required', p_total_amount,
            'current', v_deposit_balance
        );
    END IF;

    v_new_balance := v_deposit_balance - p_total_amount;

    -- 예치금 차감
    UPDATE public.profiles
    SET deposit_balance = v_new_balance
    WHERE id = p_brand_id;

    -- 차감 내역 기록 (brand_deposits에 use 타입으로)
    INSERT INTO public.brand_deposits (
        brand_id,
        type,
        amount,
        balance_after,
        status,
        note,
        reference_id
    ) VALUES (
        p_brand_id,
        'use',
        p_total_amount,
        v_new_balance,
        'confirmed',
        '콘테스트 상금 에스크로 예치',
        p_contest_id::text
    );

    -- 콘테스트 상태를 published로 변경 (ContestCard에서 '공개중' 기준)
    UPDATE public.ad_contests
    SET status = 'published'
    WHERE id = p_contest_id;

    RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance);
END;
$$;

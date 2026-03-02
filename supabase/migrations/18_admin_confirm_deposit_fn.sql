-- Migration: Add SECURITY DEFINER function for admin deposit confirmation
-- Fixes: admin cannot update profiles.deposit_balance due to RLS (only own row update allowed)
-- Solution: Use a function that runs as DB owner, bypassing RLS, but only callable by admin

CREATE OR REPLACE FUNCTION public.admin_confirm_deposit(
    p_deposit_id   uuid,
    p_brand_id     uuid,
    p_amount       integer,
    p_new_balance  integer,
    p_confirmed_by uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- 관리자만 호출 가능
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: admin only';
    END IF;

    -- 1. brand_deposits 상태 업데이트 (status: confirmed, 실제 금액 기록)
    UPDATE public.brand_deposits
    SET
        amount       = p_amount,
        balance_after = p_new_balance,
        status       = 'confirmed',
        confirmed_by = p_confirmed_by,
        confirmed_at = NOW()
    WHERE id = p_deposit_id;

    -- 2. profiles.deposit_balance 증액 (RLS bypass)
    UPDATE public.profiles
    SET deposit_balance = p_new_balance
    WHERE id = p_brand_id;
END;
$$;

-- 함수 실행 권한: authenticated 유저 (내부에서 is_admin() 체크함)
GRANT EXECUTE ON FUNCTION public.admin_confirm_deposit(uuid, uuid, integer, integer, uuid)
    TO authenticated;

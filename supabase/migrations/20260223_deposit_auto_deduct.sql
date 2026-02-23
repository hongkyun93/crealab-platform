-- =====================================================
-- 예치금(Deposit) 자동 차감 트리거  [G9]
-- Created: 2026-02-23
--
-- 동작: 협업 계약서가 양측 모두 서명 완료(contract_status = 'signed')될 때
--       브랜드의 deposit_balance에서 price_offer만큼 자동 차감하고
--       brand_deposits에 type='use' 레코드를 삽입.
--
-- 적용 테이블:
--   - product_applications
--   - moment_proposals
-- (campaign_applications는 price_offer가 정수형이라 동일 로직 적용)
-- =====================================================


-- ─── Helper 함수 ──────────────────────────────────────────────────────────────
-- 예치금 차감 + brand_deposits 기록 삽입
CREATE OR REPLACE FUNCTION public.fn_deduct_deposit_on_contract_signed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
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
    v_amount     := COALESCE(NEW.price_offer, 0);
    v_prop_id    := NEW.id::text;

    IF TG_TABLE_NAME = 'product_applications' THEN
        v_prop_label := 'product_application';
    ELSIF TG_TABLE_NAME = 'moment_proposals' THEN
        v_prop_label := 'moment_proposal';
    ELSIF TG_TABLE_NAME = 'campaign_applications' THEN
        -- campaign_applications는 brand_id가 campaigns 테이블에 있음
        SELECT c.brand_id INTO v_brand_id
        FROM public.campaigns c WHERE c.id = NEW.campaign_id;
        v_prop_label := 'campaign_application';
    END IF;

    -- price_offer가 0이면 차감 불필요
    IF v_amount <= 0 OR v_brand_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- 중복 차감 방지: 이미 'use' 레코드가 있으면 스킵
    IF EXISTS (
        SELECT 1 FROM public.brand_deposits
        WHERE brand_id = v_brand_id
          AND note = v_prop_label || ':' || v_prop_id
          AND type = 'use'
    ) THEN
        RETURN NEW;
    END IF;

    -- 현재 잔액 조회
    SELECT COALESCE(deposit_balance, 0) INTO v_balance
    FROM public.profiles WHERE id = v_brand_id;

    -- 브랜드 deposit_balance 차감
    UPDATE public.profiles
    SET deposit_balance = GREATEST(0, COALESCE(deposit_balance, 0) - v_amount)
    WHERE id = v_brand_id;

    -- brand_deposits에 'use' 레코드 삽입
    INSERT INTO public.brand_deposits (
        brand_id,
        amount,
        type,
        status,
        note,
        confirmed_at
    ) VALUES (
        v_brand_id,
        v_amount,
        'use',
        'confirmed',  -- 서명 완료 = 확정
        v_prop_label || ':' || v_prop_id,
        now()
    );

    RETURN NEW;
END;
$$;


-- ─── Trigger 연결 ──────────────────────────────────────────────────────────────

-- product_applications: 계약 서명 완료 시
DROP TRIGGER IF EXISTS trg_deposit_deduct_on_product_application_signed ON public.product_applications;
CREATE TRIGGER trg_deposit_deduct_on_product_application_signed
    AFTER UPDATE OF contract_status ON public.product_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_deduct_deposit_on_contract_signed();

-- moment_proposals: 계약 서명 완료 시
DROP TRIGGER IF EXISTS trg_deposit_deduct_on_moment_proposal_signed ON public.moment_proposals;
CREATE TRIGGER trg_deposit_deduct_on_moment_proposal_signed
    AFTER UPDATE OF contract_status ON public.moment_proposals
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_deduct_deposit_on_contract_signed();

-- campaign_applications: 계약 서명 완료 시
DROP TRIGGER IF EXISTS trg_deposit_deduct_on_campaign_application_signed ON public.campaign_applications;
CREATE TRIGGER trg_deposit_deduct_on_campaign_application_signed
    AFTER UPDATE OF contract_status ON public.campaign_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_deduct_deposit_on_contract_signed();


-- ─── brand_deposits RLS ───────────────────────────────────────────────────────
-- 브랜드 본인만 자신의 예치금 내역 조회 가능
-- admin도 조회 가능 (관리 목적)
DROP POLICY IF EXISTS "brand_deposits_select" ON public.brand_deposits;
CREATE POLICY "brand_deposits_select"
    ON public.brand_deposits FOR SELECT
    USING (auth.uid() = brand_id OR public.is_admin());

-- INSERT는 브랜드 본인 (charge 요청) 또는 service_role (use/confirmed)
DROP POLICY IF EXISTS "brand_deposits_insert" ON public.brand_deposits;
CREATE POLICY "brand_deposits_insert"
    ON public.brand_deposits FOR INSERT
    WITH CHECK (auth.uid() = brand_id OR public.is_admin());

-- UPDATE는 admin만 (충전 확인/거절)
DROP POLICY IF EXISTS "brand_deposits_update" ON public.brand_deposits;
CREATE POLICY "brand_deposits_update"
    ON public.brand_deposits FOR UPDATE
    USING (public.is_admin());

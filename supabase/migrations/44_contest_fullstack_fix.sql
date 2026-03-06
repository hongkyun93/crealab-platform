-- 44_contest_fullstack_fix.sql
-- Supabase SQL Editor에서 실행하세요.
-- workspaces 실제 컬럼 API로 직접 확인 후 작성 (2026-03-05)

-- ──────────────────────────────────────────────────────────────
-- 1. ad_contest_applications 컬럼 추가
-- ──────────────────────────────────────────────────────────────
ALTER TABLE public.ad_contest_applications
    ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id);

ALTER TABLE public.ad_contest_applications
    ADD COLUMN IF NOT EXISTS brand_note TEXT DEFAULT NULL;

-- ──────────────────────────────────────────────────────────────
-- 2. settlements.proposal_type CHECK 제약 제거 (contest_application 허용)
-- ──────────────────────────────────────────────────────────────
ALTER TABLE public.settlements
    DROP CONSTRAINT IF EXISTS settlements_proposal_type_check;

-- ──────────────────────────────────────────────────────────────
-- 3. select_contest_challenger RPC
--
--    workspaces 실제 확인된 컬럼만 사용:
--      original_proposal_id, original_proposal_type,
--      status, price_offer, contract_status,
--      brand_signed_at, product_name
--
--    존재하지 않는 컬럼 (사용 금지):
--      proposal_type, proposal_id, updated_at,
--      target_id, target_name, type
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.select_contest_challenger(
    p_application_id UUID
) RETURNS UUID AS $$
DECLARE
    v_workspace_id  UUID;
    v_contest_id    UUID;
    v_brand_id      UUID;
    v_creator_id    UUID;
    v_contest_title TEXT;
    v_base_reward   INTEGER;
BEGIN
    -- 1. 지원서 + 콘테스트 정보 조회
    SELECT
        a.contest_id,
        a.creator_id,
        c.brand_id,
        c.title,
        COALESCE(c.base_reward, 0)
    INTO
        v_contest_id,
        v_creator_id,
        v_brand_id,
        v_contest_title,
        v_base_reward
    FROM public.ad_contest_applications a
    JOIN public.ad_contests c ON c.id = a.contest_id
    WHERE a.id = p_application_id;

    IF v_contest_id IS NULL THEN
        RAISE EXCEPTION '해당 지원서를 찾을 수 없습니다. (id: %)', p_application_id;
    END IF;

    -- 2. 워크스페이스 생성 (실제 확인된 컬럼만 사용)
    INSERT INTO public.workspaces (
        brand_id,
        creator_id,
        project_title,
        original_proposal_id,
        original_proposal_type,
        status,
        price_offer,
        contract_status,
        brand_signed_at,
        product_name,
        created_at
    ) VALUES (
        v_brand_id,
        v_creator_id,
        COALESCE(v_contest_title, '콘테스트 프로젝트'),
        p_application_id,
        'contest',
        'active',
        v_base_reward,
        'brand_signed',
        NOW(),
        COALESCE(v_contest_title, '콘테스트 프로젝트'),
        NOW()
    ) RETURNING id INTO v_workspace_id;

    -- 3. 지원서에 workspace 연결 + 상태 변경
    UPDATE public.ad_contest_applications
    SET
        workspace_id = v_workspace_id,
        status = 'selected'
    WHERE id = p_application_id;

    -- 4. 시스템 안내 메시지
    INSERT INTO public.messages (
        workspace_id,
        sender_id,
        receiver_id,
        content,
        is_read,
        is_mock
    ) VALUES (
        v_workspace_id,
        v_brand_id,
        v_creator_id,
        '🏆 [시스템] 콘테스트 챌린저로 선발되었습니다! 워크스페이스에서 진행 방법을 확인해주세요.',
        false,
        true
    );

    RETURN v_workspace_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ──────────────────────────────────────────────────────────────
-- 4. 콘테스트 정산 자동 생성 트리거
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.fn_handle_contest_settlement_lifecycle()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
AS $$
DECLARE
    v_brand_id      uuid;
    v_gross         integer;
    v_team_id       uuid;
    v_split_ratio   numeric(4,3);
    v_creator_amt   integer;
    v_mcn_amt       integer;
    v_withhold_rate numeric(5,4) := 0.033;
    v_withhold_amt  integer;
    v_net_amt       integer;
    v_month         text;
BEGIN
    IF NEW.status != 'completed' OR OLD.status = 'completed' THEN
        RETURN NEW;
    END IF;

    SELECT brand_id, COALESCE(base_reward, 0)
    INTO v_brand_id, v_gross
    FROM public.ad_contests
    WHERE id = NEW.contest_id;

    IF v_gross <= 0 THEN RETURN NEW; END IF;

    SELECT tm.team_id INTO v_team_id
    FROM public.team_members tm
    JOIN public.team_members owner_tm
        ON owner_tm.team_id = tm.team_id AND owner_tm.role = 'owner'
    JOIN public.profiles owner_p
        ON owner_p.id = owner_tm.user_id AND owner_p.role = 'mcn'
    WHERE tm.user_id = NEW.creator_id AND tm.role != 'owner'
    LIMIT 1;

    IF v_team_id IS NOT NULL THEN
        SELECT split_ratio INTO v_split_ratio
        FROM public.mcn_revenue_splits
        WHERE team_id = v_team_id AND creator_id = NEW.creator_id;
        IF NOT FOUND THEN v_split_ratio := 0.700; END IF;
    ELSE
        v_split_ratio := 1.000;
    END IF;

    v_creator_amt  := ROUND(v_gross * v_split_ratio);
    v_mcn_amt      := v_gross - v_creator_amt;
    v_withhold_amt := ROUND(v_creator_amt * v_withhold_rate);
    v_net_amt      := v_creator_amt - v_withhold_amt;
    v_month        := TO_CHAR(NOW(), 'YYYY-MM');

    IF NOT EXISTS (
        SELECT 1 FROM public.settlements
        WHERE proposal_id = NEW.id::text
          AND proposal_type = 'contest_application'
    ) THEN
        INSERT INTO public.settlements (
            team_id, creator_id, brand_id, workspace_id,
            proposal_type, proposal_id,
            gross_amount, split_ratio,
            creator_amount, mcn_amount,
            withholding_rate, withholding_amount,
            net_creator_amount,
            settlement_month, status, note
        ) VALUES (
            v_team_id, NEW.creator_id, v_brand_id, NEW.workspace_id,
            'contest_application', NEW.id::text,
            v_gross, v_split_ratio,
            v_creator_amt, v_mcn_amt,
            v_withhold_rate, v_withhold_amt,
            v_net_amt,
            v_month, 'pending',
            '콘테스트 완료 후 지급 예정'
        );
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_handle_contest_settlement ON public.ad_contest_applications;
CREATE TRIGGER trg_handle_contest_settlement
AFTER UPDATE OF status ON public.ad_contest_applications
FOR EACH ROW EXECUTE FUNCTION public.fn_handle_contest_settlement_lifecycle();

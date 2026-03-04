-- 38_contest_workspace_integration.sql

-- 1. ad_contest_applications 테이블에 workspace_id 추가
ALTER TABLE public.ad_contest_applications 
ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id);

-- 2. 챌린저 선발용 RPC (상호 원자성 보장)
-- 선발 시: 1) workspaces 레코드 생성(브랜드 서명 포함) 2) 지원서에 workspace_id 업데이트
CREATE OR REPLACE FUNCTION public.select_contest_challenger(
    p_application_id UUID,
    p_brand_id UUID,
    p_creator_id UUID,
    p_contest_id UUID,
    p_contract_content TEXT,
    p_brand_signature TEXT
) RETURNS UUID AS $$
DECLARE
    v_workspace_id UUID;
    v_contest_title TEXT;
BEGIN
    SELECT title INTO v_contest_title FROM public.ad_contests WHERE id = p_contest_id;

    -- A. 워크스페이스 생성 (브랜드 서명 상태로 시작)
    INSERT INTO public.workspaces (
        brand_id, 
        creator_id, 
        target_id, 
        target_name, 
        type, 
        status, 
        contract_content,
        brand_signature,
        brand_signed_at,
        contract_status
    ) VALUES (
        p_brand_id,
        p_creator_id,
        p_contest_id,
        COALESCE(v_contest_title, '콘테스트 프로젝트'),
        'contest',
        'contract',
        p_contract_content,
        p_brand_signature,
        NOW(),
        'brand_signed' -- 브랜드 서명 완료 상태
    ) RETURNING id INTO v_workspace_id;

    -- B. 지원서에 워크스페이스 연결 및 상태 변경
    UPDATE public.ad_contest_applications
    SET workspace_id = v_workspace_id,
        status = 'selected'
    WHERE id = p_application_id;

    RETURN v_workspace_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 콘테스트 정산 자동 생성 함수 보완
-- ad_contest_applications의 상태가 'completed'로 변경될 때 정산 생성
CREATE OR REPLACE FUNCTION public.fn_handle_contest_settlement_lifecycle()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
AS $$
DECLARE
    v_contest_id    uuid;
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
    v_month         text;
BEGIN
    -- 'completed' 상태로 변경될 때만 실행
    IF NEW.status != 'completed' OR OLD.status = 'completed' THEN
        RETURN NEW;
    END IF;

    v_contest_id := NEW.contest_id;
    -- 콘테스트 정보에서 상금(award_amount) 또는 지원서의 제안가 사용
    -- 여기서는 지원 단계의 price_offer가 있다면 그것을 우선시 (또는 콘테스트 기본 상금)
    SELECT brand_id, award_amount INTO v_brand_id, v_gross 
    FROM public.ad_contests WHERE id = v_contest_id;
    
    v_gross := COALESCE(NEW.price_offer, v_gross, 0);

    IF v_gross <= 0 THEN RETURN NEW; END IF;

    -- MCN 팀 및 수익 배분 비율 조회
    SELECT tm.team_id INTO v_team_id
    FROM public.team_members tm
    JOIN public.team_members owner_tm ON owner_tm.team_id=tm.team_id AND owner_tm.role='owner'
    JOIN public.profiles owner_p ON owner_p.id=owner_tm.user_id AND owner_p.role='mcn'
    WHERE tm.user_id=NEW.creator_id AND tm.role != 'owner' LIMIT 1;

    IF v_team_id IS NOT NULL THEN
        SELECT split_ratio INTO v_split_ratio FROM public.mcn_revenue_splits WHERE team_id = v_team_id AND creator_id = NEW.creator_id;
        IF NOT FOUND THEN v_split_ratio := 0.700; END IF;
    ELSE
        v_split_ratio := 1.000;
    END IF;

    v_creator_amt := ROUND(v_gross * v_split_ratio);
    v_mcn_amt     := v_gross - v_creator_amt;
    v_withhold_amt:= ROUND(v_creator_amt * v_withhold_rate);
    v_net_amt     := v_creator_amt - v_withhold_amt;
    v_month       := TO_CHAR(NOW(), 'YYYY-MM');

    -- 중복 생성 방지 및 정산 데이터 삽입
    IF NOT EXISTS (SELECT 1 FROM public.settlements WHERE proposal_id = NEW.id::text AND proposal_type = 'contest_application') THEN
        INSERT INTO public.settlements (
            team_id, creator_id, brand_id, workspace_id,
            proposal_type, proposal_id,
            gross_amount, split_ratio,
            creator_amount, mcn_amount,
            withholding_rate, withholding_amount,
            net_creator_amount, settlement_month, status,
            note
        ) VALUES (
            v_team_id, NEW.creator_id, v_brand_id, NEW.workspace_id,
            'contest_application', NEW.id::text,
            v_gross, v_split_ratio,
            v_creator_amt, v_mcn_amt,
            v_withhold_rate, v_withhold_amt,
            v_net_amt, v_month, 'pending',
            '반응 추이 테스트 완료 후 지급 예정'
        );
    END IF;

    RETURN NEW;
END;
$$;

-- 트리거 등록
DROP TRIGGER IF EXISTS trg_handle_contest_settlement ON public.ad_contest_applications;
CREATE TRIGGER trg_handle_contest_settlement
AFTER UPDATE OF status ON public.ad_contest_applications
FOR EACH ROW EXECUTE FUNCTION public.fn_handle_contest_settlement_lifecycle();

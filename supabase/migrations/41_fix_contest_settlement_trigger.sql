-- 41_fix_contest_settlement_trigger.sql
-- Fix: fn_handle_contest_settlement_lifecycle referenced non-existent 'award_amount' column.
-- ad_contests stores rewards as 'rank_rewards' JSONB and 'base_reward' INTEGER.
-- Correct logic: when status='completed', calculate gross amount from:
--   - awarded_rank 1 → rank_rewards->'rank1'->>'reward'
--   - awarded_rank 2 → rank_rewards->'rank2'->>'reward'
--   - awarded_rank 3 → rank_rewards->'rank3'->>'reward'
--   - no rank (미수상자) → base_reward

CREATE OR REPLACE FUNCTION public.fn_handle_contest_settlement_lifecycle()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
AS $$
DECLARE
    v_contest_id    uuid;
    v_brand_id      uuid;
    v_base_reward   integer;
    v_rank_rewards  jsonb;
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

    -- [FIX] award_amount 컬럼 대신 base_reward + rank_rewards JSONB 사용
    SELECT brand_id, base_reward, rank_rewards
    INTO v_brand_id, v_base_reward, v_rank_rewards
    FROM public.ad_contests WHERE id = v_contest_id;

    -- awarded_rank에 따라 상금 결정
    -- 수상자: rank_rewards에서 해당 등급 상금 사용
    -- 미수상자(awarded_rank IS NULL): base_reward 사용
    v_gross := CASE NEW.awarded_rank
        WHEN 1 THEN COALESCE((v_rank_rewards->'rank1'->>'reward')::integer, v_base_reward, 0)
        WHEN 2 THEN COALESCE((v_rank_rewards->'rank2'->>'reward')::integer, v_base_reward, 0)
        WHEN 3 THEN COALESCE((v_rank_rewards->'rank3'->>'reward')::integer, v_base_reward, 0)
        ELSE COALESCE(v_base_reward, 0)
    END;

    -- 금액이 0이하면 정산 생성하지 않음
    IF v_gross <= 0 THEN RETURN NEW; END IF;

    -- MCN 팀 및 수익 배분 비율 조회
    SELECT tm.team_id INTO v_team_id
    FROM public.team_members tm
    JOIN public.team_members owner_tm ON owner_tm.team_id = tm.team_id AND owner_tm.role = 'owner'
    JOIN public.profiles owner_p ON owner_p.id = owner_tm.user_id AND owner_p.role = 'mcn'
    WHERE tm.user_id = NEW.creator_id AND tm.role != 'owner' LIMIT 1;

    IF v_team_id IS NOT NULL THEN
        SELECT split_ratio INTO v_split_ratio FROM public.mcn_revenue_splits WHERE team_id = v_team_id AND creator_id = NEW.creator_id;
        IF NOT FOUND THEN v_split_ratio := 0.700; END IF;
    ELSE
        v_split_ratio := 1.000;
    END IF;

    v_creator_amt  := ROUND(v_gross * v_split_ratio);
    v_mcn_amt      := v_gross - v_creator_amt;
    v_withhold_amt := ROUND(v_creator_amt * v_withhold_rate);
    v_net_amt      := v_creator_amt - v_withhold_amt;
    v_month        := TO_CHAR(NOW(), 'YYYY-MM');

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
            CASE NEW.awarded_rank
                WHEN 1 THEN '🥇 1등 수상 - 반응 추이 테스트 완료 후 지급 예정'
                WHEN 2 THEN '🥈 2등 수상 - 반응 추이 테스트 완료 후 지급 예정'
                WHEN 3 THEN '🥉 3등 수상 - 반응 추이 테스트 완료 후 지급 예정'
                ELSE '기본 참가 보상 - 반응 추이 테스트 완료 후 지급 예정'
            END
        );
    END IF;

    RETURN NEW;
END;
$$;

-- 트리거 재등록 (함수 교체 후 트리거도 갱신)
DROP TRIGGER IF EXISTS trg_handle_contest_settlement ON public.ad_contest_applications;
CREATE TRIGGER trg_handle_contest_settlement
AFTER UPDATE OF status ON public.ad_contest_applications
FOR EACH ROW EXECUTE FUNCTION public.fn_handle_contest_settlement_lifecycle();

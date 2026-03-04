-- 39_refine_contest_selection_rpc.sql

-- select_contest_challenger RPC를 더 단순하고 견고하게 수정
-- 이제 p_application_id만 받아서 내부에서 필요한 정보를 모두 처리합니다.

CREATE OR REPLACE FUNCTION public.select_contest_challenger(
    p_application_id UUID
) RETURNS UUID AS $$
DECLARE
    v_workspace_id UUID;
    v_contest_id UUID;
    v_brand_id UUID;
    v_creator_id UUID;
    v_contest_title TEXT;
    v_brand_name TEXT;
    v_price_offer INTEGER;
BEGIN
    -- 1. 지원서 정보 및 관련 정보 가져오기 (JOIN을 통해 브랜드명과 콘테스트 제목 확보)
    SELECT 
        a.contest_id, a.creator_id, a.price_offer,
        c.brand_id, c.title,
        p.display_name
    INTO 
        v_contest_id, v_creator_id, v_price_offer,
        v_brand_id, v_contest_title,
        v_brand_name
    FROM public.ad_contest_applications a
    JOIN public.ad_contests c ON c.id = a.contest_id
    JOIN public.profiles p ON p.id = c.brand_id
    WHERE a.id = p_application_id;

    -- 지원서가 없거나 삭제된 경우 예외 처리
    IF v_contest_id IS NULL THEN
        RAISE EXCEPTION '해당 지원서를 찾을 수 없거나 관련 데이터가 부족합니다.';
    END IF;

    -- 2. 워크스페이스 생성 (브랜드 서명 완료 상태로 시작)
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
        contract_status,
        price_offer
    ) VALUES (
        v_brand_id,
        v_creator_id,
        v_contest_id,
        COALESCE(v_contest_title, '콘테스트 프로젝트'),
        'contest',
        'contract',
        '본 계약은 콘테스트 지원 및 선발에 따른 표준 협업 계약입니다.',
        v_brand_name || ' (Digital Signature)', -- 브랜드 이름을 서명으로 활용
        NOW(),
        'brand_signed', -- [핵심] 브랜드가 선발하는 즉시 서명된 상태로 생성
        v_price_offer
    ) RETURNING id INTO v_workspace_id;

    -- 3. 지원서(ad_contest_applications)에 워크스페이스 연결 및 상태 변경
    UPDATE public.ad_contest_applications
    SET workspace_id = v_workspace_id,
        status = 'selected'
    WHERE id = p_application_id;

    -- 4. 생성된 워크스페이스 ID 반환
    RETURN v_workspace_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

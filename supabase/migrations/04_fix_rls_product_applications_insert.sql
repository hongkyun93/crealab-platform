-- Fix: product_applications INSERT RLS 정책
-- 크리에이터(influencer)가 제안서를 보낼 수 있도록 influencer_id 조건 추가
-- 기존: brand_id = auth.uid() 또는 브랜드 팀 멤버만 INSERT 가능
-- 수정: influencer_id = auth.uid() 또는 influencer 팀 멤버도 INSERT 가능

DROP POLICY IF EXISTS brand_proposals_insert ON public.product_applications;

CREATE POLICY brand_proposals_insert ON public.product_applications
FOR INSERT TO authenticated
WITH CHECK (
    (auth.uid() = brand_id)
    OR (auth.uid() = influencer_id)
    OR (brand_team_id IN (SELECT public.get_user_team_ids(auth.uid())))
    OR (influencer_team_id IN (SELECT public.get_user_team_ids(auth.uid())))
);

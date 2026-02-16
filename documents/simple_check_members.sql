-- RLS 무시하고 전체 team_members 데이터 확인 (admin용)
-- Supabase에서 실행할 때는 RLS가 자동으로 적용되므로,
-- 아래 쿼리로 본인이 볼 수 있는 모든 데이터를 확인

SELECT 
    id,
    team_id,
    user_id,
    role,
    created_at
FROM public.team_members
LIMIT 10;

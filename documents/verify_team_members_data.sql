-- 실제 DB에 있는 team_members 데이터 확인
SELECT 
    tm.id as record_id,
    tm.team_id,
    tm.user_id,
    tm.role,
    p.email,
    p.display_name,
    t.name as team_name
FROM public.team_members tm
LEFT JOIN public.profiles p ON tm.user_id = p.id
LEFT JOIN public.teams t ON tm.team_id = t.id
WHERE t.created_by = auth.uid()
ORDER BY t.name;

-- Debug query to check what's happening with role updates
-- Run this in Supabase SQL Editor to see the actual team_members data

-- 1. Check all team members and their IDs
SELECT 
    tm.id as member_record_id,
    tm.user_id,
    tm.team_id,
    tm.role,
    p.email,
    p.display_name,
    t.name as team_name
FROM public.team_members tm
JOIN public.profiles p ON tm.user_id = p.id
JOIN public.teams t ON tm.team_id = t.id
ORDER BY t.name, p.display_name;

-- 2. Check if the RLS helper function works
SELECT public.is_team_owner_or_admin(
    (SELECT team_id FROM public.team_members WHERE user_id = auth.uid() LIMIT 1),
    auth.uid()
) as can_manage;

-- 3. Test if you can update (replace the UUID with actual member record id from query 1)
-- UPDATE public.team_members 
-- SET role = 'admin' 
-- WHERE id = 'PASTE_ACTUAL_MEMBER_ID_HERE';

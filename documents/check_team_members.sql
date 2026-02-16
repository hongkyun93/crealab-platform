-- Quick check: What does team_members table actually have?
SELECT 
    id,
    user_id,
    team_id,
    role,
    created_at
FROM public.team_members
LIMIT 5;

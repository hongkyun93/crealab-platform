-- Check user's team membership
SELECT * FROM team_members WHERE user_id = 'c4d62153-2708-410c-992a-350e90fa2b79'; -- Assuming this is the brand user based on previous context, or I'll query by email if needed.

-- Actually, better to query by email to be safe if I don't have the ID handy.
-- But wait, I can just check limits.

SELECT 
    p.email, 
    p.role, 
    tm.team_id, 
    t.name as team_name,
    c.id as campaign_id,
    c.title as campaign_title,
    c.team_id as campaign_team_id,
    c.brand_id as campaign_brand_id
FROM profiles p
LEFT JOIN team_members tm ON p.id = tm.user_id
LEFT JOIN teams t ON tm.team_id = t.id
LEFT JOIN campaigns c ON p.id = c.brand_id
WHERE p.email = 'brand@example.com'; -- Replace with actual test brand email if known, or just list a few.

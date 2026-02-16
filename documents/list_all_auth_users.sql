-- List all users in the authentication layer (auth.users)
-- This query will show you all registered accounts.

SELECT 
    id, 
    email, 
    raw_user_meta_data->>'role' as role_in_metadata,
    created_at::timestamp(0) as created_at,
    last_sign_in_at::timestamp(0) as last_login
FROM auth.users
ORDER BY created_at DESC;

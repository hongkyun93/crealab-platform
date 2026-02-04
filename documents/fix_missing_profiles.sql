-- Fix missing profiles for existing users
-- Run this in Supabase SQL Editor

-- 1. Check current user's profile
SELECT 
    auth.uid() as current_user_id,
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()) as has_profile;

-- 2. If has_profile is false, create profile for current user
INSERT INTO profiles (id, email, display_name, role, created_at, updated_at)
SELECT 
    auth.uid(),
    au.email,
    COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
    CASE 
        WHEN au.raw_user_meta_data->>'role_type' = 'brand' THEN 'brand'::user_role
        ELSE 'influencer'::user_role
    END,
    NOW(),
    NOW()
FROM auth.users au
WHERE au.id = auth.uid()
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = COALESCE(profiles.display_name, EXCLUDED.display_name),
    updated_at = NOW();

-- 3. Verify the profile was created
SELECT * FROM profiles WHERE id = auth.uid();

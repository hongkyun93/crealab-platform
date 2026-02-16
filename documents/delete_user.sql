-- Helper script to delete user completely from authentication layer
-- This will CASCADE delete their profile as well.

-- Replace 'EMAIL_HERE' with the actual email you want to delete
DELETE FROM auth.users WHERE email = 'YOUR_EMAIL_HERE';

-- Example:
-- DELETE FROM auth.users WHERE email = 'test@example.com';

-- ⚠️ DANGER: This script deletes ALL users from the system.
-- Use this only if you want to completely reset all accounts and start fresh.
-- Deleting from auth.users will automatically delete linked data from public.profiles (CASCADE).

BEGIN;

-- 1. Delete all users from the authentication table
DELETE FROM auth.users;

-- 2. (Optional safeguard) Explicitly truncate profiles to ensure clean slate
TRUNCATE TABLE public.profiles CASCADE;

COMMIT;

-- Confirm deletion
SELECT count(*) as remaining_users FROM auth.users;

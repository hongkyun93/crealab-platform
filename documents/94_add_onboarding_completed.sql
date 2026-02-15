-- Migration: Add onboarding_completed flag and set existing users as completed
-- This ensures existing users skip onboarding, only new signups see it

-- Step 1: Add column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Step 2: Mark ALL existing users as completed (prevent interruption)
UPDATE public.profiles 
SET onboarding_completed = true 
WHERE id IS NOT NULL;

-- Step 3: Add comment for documentation
COMMENT ON COLUMN public.profiles.onboarding_completed IS 'True if user has completed initial onboarding. New signups default to false.';

-- Verification
SELECT 
    COUNT(*) as total_users,
    SUM(CASE WHEN onboarding_completed = true THEN 1 ELSE 0 END) as completed_onboarding,
    SUM(CASE WHEN onboarding_completed = false THEN 1 ELSE 0 END) as pending_onboarding
FROM public.profiles;

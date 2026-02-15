-- Simple migration: Update role values only
-- Column renames will be done in a separate migration

-- Update profiles.role
UPDATE public.profiles  
SET role = 'creator'
WHERE role = 'influencer';

-- Update profiles.user_type  
UPDATE public.profiles
SET user_type = 'creator'
WHERE user_type = 'influencer';

-- Update default value
ALTER TABLE public.profiles 
ALTER COLUMN user_type SET DEFAULT 'creator';

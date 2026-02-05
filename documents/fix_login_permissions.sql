-- =========================================
-- MASTER PERMISSIONS FIX: PROFILES & ROLES
-- =========================================

-- 1. Ensure Profiles Table RLS is Correct
-- This is critical for the application to know if a user is Brand or Creator.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to SEE their own profile (Critical for Login logic)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles 
FOR SELECT USING (auth.uid() = id);

-- Allow users to UPDATE their own profile (Critical for Role Switch)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles 
FOR UPDATE USING (auth.uid() = id);

-- Allow users to INSERT (Signup) - using a trigger usually, but explicit policy is good
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Grant Table Permissions
GRANT SELECT, UPDATE, INSERT ON public.profiles TO authenticated;
GRANT SELECT, UPDATE, INSERT ON public.profiles TO service_role;

-- 3. Verify Product Permissions (just in case)
GRANT ALL ON public.brand_products TO authenticated;

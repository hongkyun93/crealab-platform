-- =========================================
-- FIX ROLE SWITCH PERMISSIONS & DATA
-- =========================================

-- 1. Ensure role column can be updated by the owner
DROP POLICY IF EXISTS "Users can update own profile role" ON public.profiles;
CREATE POLICY "Users can update own profile role" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- 2. Ensure influencer_details can be upserted (for switching to influencer)
DROP POLICY IF EXISTS "Users can upsert own influencer details" ON public.influencer_details;
CREATE POLICY "Users can upsert own influencer details" 
ON public.influencer_details 
FOR ALL
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- 3. Grant full access to authenticated users on these tables for their own records
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.influencer_details TO authenticated;

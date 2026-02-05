-- =========================================
-- FIX SELECT PERMISSIONS (RLS)
-- =========================================
-- This script ensures users can READ their own data

-- 1. Profiles Table SELECT policy
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Also allow everyone to view profiles if needed (e.g. for brand to see creators)
-- If you want privacy, keep it restricted to 'id'. But for a platform:
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
CREATE POLICY "Anyone can view profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

-- 2. Influencer Details Table SELECT policy
DROP POLICY IF EXISTS "Users can view own influencer details" ON public.influencer_details;
CREATE POLICY "Users can view own influencer details" 
ON public.influencer_details 
FOR SELECT 
USING (auth.uid() = id);

-- Also allow everyone to view details (needed for matching/discovery)
DROP POLICY IF EXISTS "Anyone can view influencer details" ON public.influencer_details;
CREATE POLICY "Anyone can view influencer details" 
ON public.influencer_details 
FOR SELECT 
USING (true);

-- 3. Messages Table (Fix for the AbortError spam)
-- If policies are missing here, it might cause loops
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
CREATE POLICY "Users can view their own messages" 
ON public.messages 
FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- 4. Ensure foreign key for influencer_details is correct
-- Sometimes missing FK prevents the 'select(*, influencer_details(*))' join from working
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'influencer_details_id_fkey') THEN
        ALTER TABLE public.influencer_details 
        ADD CONSTRAINT influencer_details_id_fkey 
        FOREIGN KEY (id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

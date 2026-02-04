-- =========================================
-- FIX PROFILE UPDATE PERMISSIONS
-- =========================================
-- This script fixes the profile update issues for new users

-- 1. Ensure profiles table has correct RLS policies
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- 2. Add missing website column if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name text;

-- 3. Fix influencer_details policies
DROP POLICY IF EXISTS "Influencers can insert own details" ON public.influencer_details;
DROP POLICY IF EXISTS "Influencers can update own details" ON public.influencer_details;

CREATE POLICY "Users can insert own influencer details" 
ON public.influencer_details 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own influencer details" 
ON public.influencer_details 
FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- 4. Ensure the trigger function exists and works correctly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role text;
BEGIN
  -- Get role from metadata, default to 'influencer'
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'influencer');
  
  -- Insert into profiles
  INSERT INTO public.profiles (id, email, role, display_name, avatar_url, name)
  VALUES (
    NEW.id,
    NEW.email,
    user_role::user_role,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    name = COALESCE(EXCLUDED.name, public.profiles.name),
    updated_at = now();
  
  -- If influencer, create influencer_details record
  IF user_role = 'influencer' THEN
    INSERT INTO public.influencer_details (id, instagram_handle, followers_count, tags)
    VALUES (NEW.id, NULL, 0, ARRAY[]::text[])
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.influencer_details TO authenticated;

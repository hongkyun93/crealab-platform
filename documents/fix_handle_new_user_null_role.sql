-- Update handle_new_user to allow NULL role (for Onboarding)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, extensions
AS $$
DECLARE
  preferred_role text;
  user_name text;
BEGIN
  -- 1. Determine Role
  -- Check metadata first. If missing, leave as NULL to trigger onboarding.
  preferred_role := new.raw_user_meta_data->>'role';
  
  -- REMOVED DEFAULT: IF preferred_role IS NULL THEN preferred_role := 'creator'; END IF;

  -- 2. Determine Name
  user_name := new.raw_user_meta_data->>'name';
  IF user_name IS NULL OR user_name = '' THEN
      user_name := split_part(new.email, '@', 1);
  END IF;

  -- 3. Insert Profile
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    new.id,
    new.email,
    user_name,
    preferred_role
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name);

  -- 4. Create Team (DISABLED)
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
      RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
      RAISE;
END;
$$;

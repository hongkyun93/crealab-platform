
-- Fix for handle_new_user trigger
-- 1. Use TEXT for role variable to avoid ENUM strictness issues.
-- 2. Ensure robustness of slug generation.
-- 3. Standardize fallback role to 'influencer' (matching codebase usage).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, extensions
AS $$
DECLARE
  preferred_role text; -- Changed from user_role to text
  new_team_id uuid;
  base_slug text;
  final_slug text;
  counter int;
  user_name text;
BEGIN
  -- 1. Determine Role
  -- Check metadata 'role_type' or 'role' (fallback)
  IF new.raw_user_meta_data->>'role_type' = 'brand' OR new.raw_user_meta_data->>'role' = 'brand' THEN
    preferred_role := 'brand';
  ELSE
    preferred_role := 'influencer';
  END IF;

  -- 2. Determine Name
  user_name := COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
  IF user_name IS NULL OR user_name = '' THEN
      user_name := 'User';
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
    
  -- 4. Create Team (For everyone)
    
    -- Generate Slug
    base_slug := lower(regexp_replace(user_name, '[^a-zA-Z0-9]', '', 'g'));
    IF base_slug IS NULL OR base_slug = '' THEN base_slug := 'team'; END IF;
    
    final_slug := base_slug;
    counter := 1;
    
    -- Ensure unique slug
    WHILE EXISTS (SELECT 1 FROM public.teams WHERE slug = final_slug) LOOP
        final_slug := base_slug || counter;
        counter := counter + 1;
    END LOOP;

    -- Insert Team
    INSERT INTO public.teams (name, slug, logo_url)
    VALUES (
        user_name,
        final_slug,
        new.raw_user_meta_data->>'avatar_url'
    )
    RETURNING id INTO new_team_id;

    -- Insert Team Member (Owner)
    INSERT INTO public.team_members (team_id, user_id, role)
    VALUES (
        new_team_id,
        new.id,
        'owner'
    );

  RETURN new;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error (visible in Supabase logs) then raise
        RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
        RAISE; -- Re-raise to fail the transaction (signup failure is better than partial state)
END;
$$;

-- Fix handle_new_user Trigger to Allow NULL role
-- Issue: Trigger always sets role to 'influencer' as default, preventing NULL role for onboarding
-- Solution: Only set role if explicitly provided in metadata

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, extensions
AS $$
DECLARE
  preferred_role text; -- Can be NULL
  new_team_id uuid;
  base_slug text;
  final_slug text;
  counter int;
  user_name text;
BEGIN
  -- 1. Determine Role (Allow NULL for onboarding)
  -- Only set role if explicitly provided in metadata
  IF new.raw_user_meta_data->>'role_type' = 'brand' OR new.raw_user_meta_data->>'role' = 'brand' THEN
    preferred_role := 'brand';
  ELSIF new.raw_user_meta_data->>'role_type' = 'influencer' OR new.raw_user_meta_data->>'role' = 'influencer' THEN
    preferred_role := 'influencer';
  ELSIF new.raw_user_meta_data->>'role_type' = 'mcn' OR new.raw_user_meta_data->>'role' = 'mcn' THEN
    preferred_role := 'mcn';
  ELSIF new.raw_user_meta_data->>'role_type' = 'agency' OR new.raw_user_meta_data->>'role' = 'agency' THEN
    preferred_role := 'agency';
  ELSE
    preferred_role := NULL; -- Leave NULL for onboarding
  END IF;

  -- 2. Determine Name
  user_name := COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
  IF user_name IS NULL OR user_name = '' THEN
      user_name := 'User';
  END IF;

  -- 3. Insert Profile (role can be NULL)
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    new.id, 
    new.email, 
    user_name, 
    preferred_role  -- Can be NULL
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name);
    
  -- 4. Create Team (Only if role is set - skip for NULL role users)
  IF preferred_role IS NOT NULL THEN
    -- Generate Slug
    base_slug := lower(regexp_replace(user_name, '[^a-zA-Z0-9]', '', 'g'));
    IF base_slug IS NULL OR base_slug = '' THEN base_slug := 'team'; END IF;
    
    final_slug := base_slug;
    counter := 1;
    
    -- Ensure unique slug
    WHILE EXISTS (SELECT 1 FROM public.teams WHERE slug = final_slug) LOOP
      final_slug := base_slug || counter::text;
      counter := counter + 1;
    END LOOP;
    
    -- Create team
    INSERT INTO public.teams (name, slug, created_by)
    VALUES (user_name || '''s Team', final_slug, new.id)
    RETURNING id INTO new_team_id;
    
    -- Add creator as owner
    INSERT INTO public.team_members (team_id, user_id, role)
    VALUES (new_team_id, new.id, 'owner');
  END IF;
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$;

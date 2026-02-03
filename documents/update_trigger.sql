-- Trigger function to handle new user creation using metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  preferred_role user_role;
begin
  -- Check user metadata for Role preference (sent from client during signup)
  -- Default to 'influencer' if not specified
  if new.raw_user_meta_data->>'role_type' = 'brand' then
    preferred_role := 'brand';
  else
    preferred_role := 'influencer';
  end if;

  insert into public.profiles (id, email, display_name, role)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 
    preferred_role
  );
  return new;
end;
$$;

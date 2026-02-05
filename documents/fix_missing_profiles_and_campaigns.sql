-- 1. Ensure `public` schema usage permissions
grant usage on schema public to postgres, anon, authenticated, service_role;

-- 2. Sync missing profiles from auth.users (Safe Insert)
-- This ensures that if a user exists in auth.users but not in profiles, they get created.
-- This fixes "Foreign Key Violation" errors when inserting into campaigns.
insert into public.profiles (id, email, display_name, role)
select 
  id, 
  email, 
  coalesce(raw_user_meta_data->>'name', split_part(email, '@', 1)), 
  coalesce((raw_user_meta_data->>'role')::user_role, 'brand'::user_role)
from auth.users
where id not in (select id from public.profiles);

-- 3. Ensure campaigns table exists and has correct permissions
create table if not exists public.campaigns (
  id uuid default gen_random_uuid() primary key,
  brand_id uuid references public.profiles(id) not null,
  title text not null,
  description text not null,
  product_name text not null,
  product_image_url text,
  budget_min integer,
  budget_max integer,
  target_moment_id uuid,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Reset & Re-apply RLS for Campaigns
alter table public.campaigns enable row level security;

drop policy if exists "active_campaigns_view" on campaigns;
create policy "active_campaigns_view" 
on campaigns for select 
using ( status = 'active' );

drop policy if exists "brand_insert_campaign" on campaigns;
create policy "brand_insert_campaign" 
on campaigns for insert 
with check ( auth.uid() = brand_id );

drop policy if exists "brand_update_campaign" on campaigns;
create policy "brand_update_campaign" 
on campaigns for update 
using ( auth.uid() = brand_id );

drop policy if exists "brand_delete_campaign" on campaigns;
create policy "brand_delete_campaign" 
on campaigns for delete 
using ( auth.uid() = brand_id );

-- 5. Grant explicit table permissions
grant select, insert, update, delete on public.campaigns to authenticated;
grant select on public.campaigns to anon;
grant select, insert, update, delete on public.campaigns to service_role;

-- Enable UUID extension (if not already enabled)
create extension if not exists "uuid-ossp";

-- Create campaigns table
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

-- Enable RLS
alter table public.campaigns enable row level security;

-- Policies

-- 1. Everyone can view active campaigns
drop policy if exists "Active campaigns are viewable by everyone" on campaigns;
create policy "Active campaigns are viewable by everyone" 
on campaigns for select 
using ( status = 'active' );

-- 2. Brands can insert their own campaigns
drop policy if exists "Brands can create campaigns" on campaigns;
create policy "Brands can create campaigns" 
on campaigns for insert 
with check ( auth.uid() = brand_id );

-- 3. Brands can update their own campaigns
drop policy if exists "Brands can update own campaigns" on campaigns;
create policy "Brands can update own campaigns" 
on campaigns for update 
using ( auth.uid() = brand_id );

-- 4. Brands can delete their own campaigns
drop policy if exists "Brands can delete own campaigns" on campaigns;
create policy "Brands can delete own campaigns" 
on campaigns for delete 
using ( auth.uid() = brand_id );

-- Grant permissions to authenticated users and service roles
grant select, insert, update, delete on public.campaigns to service_role;
grant select, insert, update, delete on public.campaigns to authenticated;
grant select on public.campaigns to anon;

-- ⚠️ FULL SETUP SCRIPT 
-- Run this in Supabase SQL Editor to initialize the entire database schema.
-- Warning: This script contains DROP statements which will delete existing data if run.

-- ==========================================
-- 1. CLEANUP (Optional: Remove if you want to keep data)
-- ==========================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop tables with CASCADE to remove dependent constraints/objects automatically
DROP TABLE IF EXISTS public.brand_proposals CASCADE;
DROP TABLE IF EXISTS public.influencer_events CASCADE;
DROP TABLE IF EXISTS public.proposals CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.influencer_details CASCADE;
DROP TABLE IF EXISTS public.life_moments CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TYPE IF EXISTS user_role;

-- ==========================================
-- 2. EXTENSIONS & ENUMS
-- ==========================================
create extension if not exists "uuid-ossp";
create type user_role as enum ('brand', 'influencer', 'admin');

-- ==========================================
-- 3. PROFILES (Base User Table)
-- ==========================================
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  role user_role default 'influencer',
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone" on profiles for select using ( true );
create policy "Users can insert their own profile" on profiles for insert with check ( auth.uid() = id );
create policy "Users can update own profile" on profiles for update using ( auth.uid() = id ) with check ( auth.uid() = id );

-- ==========================================
-- 4. LIFE MOMENTS (Extended Profile - Moved here to match order)
-- ==========================================
create table public.influencer_details (
  id uuid references public.profiles(id) primary key,
  instagram_handle text,
  followers_count integer,
  tier text,
  tags text[],
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.influencer_details enable row level security;

create policy "Influencer details viewable by everyone" on influencer_details for select using ( true );
create policy "Influencers can update own details" on influencer_details for update using ( auth.uid() = id );
create policy "Influencers can insert own details" on influencer_details for insert with check ( auth.uid() = id );

-- ==========================================
-- 5. LIFE MOMENTS (Constants - Renumbered)
-- ==========================================
create table public.life_moments (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  icon text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

insert into life_moments (name, icon, description) values
  ('이사/자취', '🏠', '자취 시작, 이사 준비, 인테리어'),
  ('결혼/웨딩', '💍', '결혼 준비, 프로포즈, 신혼'),
  ('출산/육아', '👶', '임신, 출산, 육아용품'),
  ('반려동물', '🐶', '반려견/묘 입양, 펫케어'),
  ('여행/레저', '✈️', '해외여행, 캠핑, 호캉스'),
  ('취업/이직', '💼', '면접, 출근룩, 데스크테리어'),
  ('운동/다이어트', '💪', '바디프로필, 식단관리'),
  ('입학/졸업', '🎓', '입학선물, 졸업식');

-- (Removed duplicate influencer_details table definition)

-- ==========================================
-- 6. CAMPAIGNS (Brand Requests)
-- ==========================================
create table public.campaigns (
  id uuid default uuid_generate_v4() primary key,
  brand_id uuid references public.profiles(id) not null,
  title text not null,
  description text not null,
  product_name text not null,
  product_image_url text,
  budget_min integer,
  budget_max integer,
  target_moment_id uuid references public.life_moments(id),
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 7. PROPOSALS (Applications)
-- ==========================================
create table public.proposals (
  id uuid default uuid_generate_v4() primary key,
  campaign_id uuid references public.campaigns(id) not null,
  influencer_id uuid references public.profiles(id) not null,
  message text,
  price_offer integer,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 8. INFLUENCER EVENTS (My Event Management)
-- ==========================================
create table public.influencer_events (
  id uuid default uuid_generate_v4() primary key,
  influencer_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  target_product text,
  event_date text,
  posting_date text,
  category text,
  tags text[],
  is_verified boolean default false,
  status text default 'recruiting',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.influencer_events enable row level security;

create policy "Influencer events are viewable by everyone" on influencer_events for select using ( true );
create policy "Influencers can insert their own events" on influencer_events for insert with check ( auth.uid() = influencer_id );
create policy "Influencers can update their own events" on influencer_events for update using ( auth.uid() = influencer_id );
create policy "Influencers can delete their own events" on influencer_events for delete using ( auth.uid() = influencer_id );

-- ==========================================
-- 9. BRAND PROPOSALS (Direct Offers)
-- ==========================================
create table public.brand_proposals (
  id uuid default uuid_generate_v4() primary key,
  brand_id uuid references public.profiles(id) not null,
  influencer_id uuid references public.profiles(id) not null,
  product_name text not null,
  product_type text default 'gift', -- gift, loan
  compensation_amount text, 
  has_incentive boolean default false,
  incentive_detail text,
  content_type text,
  message text,
  status text default 'offered', -- offered, accepted, rejected, completed
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.brand_proposals enable row level security;

create policy "Brand proposals viewable by sender and receiver" on brand_proposals for select using ( auth.uid() = brand_id or auth.uid() = influencer_id );
create policy "Brands can create proposals" on brand_proposals for insert with check ( auth.uid() = brand_id );
create policy "Receiver can update status" on brand_proposals for update using ( auth.uid() = influencer_id or auth.uid() = brand_id );

-- ==========================================
-- 10. AUTH TRIGGER (Handle New User)
-- ==========================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  preferred_role user_role;
begin
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

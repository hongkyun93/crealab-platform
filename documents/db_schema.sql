-- ⚠️ RESET SCRIPT (Warning: This will delete existing data!)
-- If you want to keep data, remove the DROP statements.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.proposals;
DROP TABLE IF EXISTS public.campaigns;
DROP TABLE IF EXISTS public.influencer_details;
DROP TABLE IF EXISTS public.life_moments;
DROP TABLE IF EXISTS public.profiles;
DROP TYPE IF EXISTS user_role;

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Create Enum for User Roles
create type user_role as enum ('brand', 'influencer', 'admin');

-- 3. Create Profiles Table (Public Profile for all users)
-- This extends the default auth.users table
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

-- 4. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 5. Policies for Profiles
-- Anyone can view profiles
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

-- Users can insert their own profile
create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

-- Users can update own profile
create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 6. Trigger to automatically create profile on signup
-- This is a very useful automation for Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (new.id, new.email, split_part(new.email, '@', 1), 'influencer');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 7. Life Moments Table (The core feature)
create table public.life_moments (
  id uuid default uuid_generate_v4() primary key,
  name text not null, -- e.g., '이사/자취', '결혼/웨딩'
  icon text, -- Emoji or icon name
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert default moments
insert into life_moments (name, icon, description) values
  ('이사/자취', '🏠', '자취 시작, 이사 준비, 인테리어'),
  ('결혼/웨딩', '💍', '결혼 준비, 프로포즈, 신혼'),
  ('출산/육아', '👶', '임신, 출산, 육아용품'),
  ('반려동물', '🐶', '반려견/묘 입양, 펫케어'),
  ('여행/레저', '✈️', '해외여행, 캠핑, 호캉스'),
  ('취업/이직', '💼', '면접, 출근룩, 데스크테리어'),
  ('운동/다이어트', '💪', '바디프로필, 식단관리'),
  ('입학/졸업', '🎓', '입학선물, 졸업식');


-- 8. Influencer Specific Details
create table public.influencer_details (
  id uuid references public.profiles(id) on delete cascade primary key,
  instagram_handle text,
  youtube_handle text,
  tiktok_handle text,
  followers_count integer default 0,
  tags text[], -- Array of strings for interests
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 9. Campaigns (Brand requests)
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
  status text default 'active', -- active, closed, draft
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Proposals / Applications
create table public.proposals (
  id uuid default uuid_generate_v4() primary key,
  campaign_id uuid references public.campaigns(id) not null,
  influencer_id uuid references public.profiles(id) not null,
  message text,
  price_offer integer,
  status text default 'pending', -- pending, accepted, rejected, completed
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

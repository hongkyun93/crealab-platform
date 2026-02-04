
-- 11. BRAND PRODUCTS (Products uploaded by brands)
create table if not exists public.brand_products (
  id uuid default uuid_generate_v4() primary key,
  brand_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  image_url text,
  price integer,
  category text,
  selling_points text, -- 소구 포인트
  required_shots text, -- 필수 촬영 컷
  website_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.brand_products enable row level security;

create policy "Brand products are viewable by everyone" on brand_products for select using ( true );
create policy "Brands can insert their own products" on brand_products for insert with check ( auth.uid() = brand_id );
create policy "Brands can update their own products" on brand_products for update using ( auth.uid() = brand_id );
create policy "Brands can delete their own products" on brand_products for delete using ( auth.uid() = brand_id );

-- =========================================
-- TOTAL SCHEMA & STORAGE FIX
-- =========================================

-- 1. Create brand_products table with all columns
create table if not exists public.brand_products (
  id uuid default uuid_generate_v4() primary key,
  brand_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  image_url text,
  price integer default 0,
  category text,
  selling_points text, -- 제품 소구 포인트
  required_shots text, -- 필수 촬영 컷
  website_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS for brand_products
alter table public.brand_products enable row level security;

-- 3. RLS Policies for brand_products
drop policy if exists "Brand products are viewable by everyone" on public.brand_products;
create policy "Brand products are viewable by everyone" on brand_products for select using ( true );

drop policy if exists "Brands can insert their own products" on public.brand_products;
create policy "Brands can insert their own products" on brand_products for insert with check ( auth.uid() = brand_id );

drop policy if exists "Brands can update their own products" on public.brand_products;
create policy "Brands can update their own products" on brand_products for update using ( auth.uid() = brand_id );

drop policy if exists "Brands can delete their own products" on public.brand_products;
create policy "Brands can delete their own products" on brand_products for delete using ( auth.uid() = brand_id );

-- 4. Create storage bucket for product-images
-- Note: This might return an error if bucket already exists, wrapping in DO block for safety
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('product-images', 'product-images', true)
    ON CONFLICT (id) DO NOTHING;
END $$;

-- 5. Storage policies for product-images bucket
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'product-images' );

drop policy if exists "Authenticated users can upload images" on storage.objects;
create policy "Authenticated users can upload images"
  on storage.objects for insert
  with check ( bucket_id = 'product-images' and auth.role() = 'authenticated' );

drop policy if exists "Authenticated users can update images" on storage.objects;
create policy "Authenticated users can update images"
  on storage.objects for update
  using ( bucket_id = 'product-images' and auth.role() = 'authenticated' );

drop policy if exists "Authenticated users can delete images" on storage.objects;
create policy "Authenticated users can delete images"
  on storage.objects for delete
  using ( bucket_id = 'product-images' and auth.role() = 'authenticated' );

-- 6. Grant permissions
grant all on public.brand_products to authenticated;
grant all on storage.objects to authenticated;
grant all on storage.buckets to authenticated;

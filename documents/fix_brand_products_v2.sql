-- Fix Brand Products Table and Permissions
-- Run this in Supabase SQL Editor

-- 1. Ensure table exists with correct schema
CREATE TABLE IF NOT EXISTS public.brand_products (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  brand_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  image_url text,
  price integer,
  category text,
  selling_points text,
  required_shots text,
  website_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.brand_products ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to ensure clean state
DROP POLICY IF EXISTS "Brand products are viewable by everyone" ON brand_products;
DROP POLICY IF EXISTS "Brands can insert their own products" ON brand_products;
DROP POLICY IF EXISTS "Brands can update their own products" ON brand_products;
DROP POLICY IF EXISTS "Brands can delete their own products" ON brand_products;

-- 4. Re-create policies
-- Everyone can view products
CREATE POLICY "Brand products are viewable by everyone" 
ON brand_products FOR SELECT 
USING ( true );

-- Brands can insert keys where brand_id matches their auth id
CREATE POLICY "Brands can insert their own products" 
ON brand_products FOR INSERT 
WITH CHECK ( auth.uid() = brand_id );

-- Brands can update their own products
CREATE POLICY "Brands can update their own products" 
ON brand_products FOR UPDATE 
USING ( auth.uid() = brand_id );

-- Brands can delete their own products
CREATE POLICY "Brands can delete their own products" 
ON brand_products FOR DELETE 
USING ( auth.uid() = brand_id );

-- 5. Grant permissions to authenticated role
GRANT ALL ON public.brand_products TO authenticated;
GRANT ALL ON public.brand_products TO service_role;

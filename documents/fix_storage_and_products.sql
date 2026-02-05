-- 🛠️ STORAGE & TABLE PERMISSIONS REPAIR
-- This script fixes both the "brand_products" table and the "product-images" storage bucket permissions.
-- Run this to resolve "Permission denied" or "signal aborted" errors during upload.

-- ==========================================
-- 1. BRAND PRODUCTS TABLE FIX
-- ==========================================
CREATE TABLE IF NOT EXISTS public.brand_products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  image_url text,
  price integer DEFAULT 0,
  category text,
  selling_points text, -- 제품 소구 포인트
  required_shots text, -- 필수 촬영 컷
  website_url text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.brand_products ENABLE ROW LEVEL SECURITY;

-- Reset Table Policies
DROP POLICY IF EXISTS "products_viewable_by_everyone" ON public.brand_products;
DROP POLICY IF EXISTS "products_insertable_by_owner" ON public.brand_products;
DROP POLICY IF EXISTS "products_updatable_by_owner" ON public.brand_products;
DROP POLICY IF EXISTS "products_deletable_by_owner" ON public.brand_products;

CREATE POLICY "products_viewable_by_everyone" ON public.brand_products FOR SELECT USING (true);
CREATE POLICY "products_insertable_by_owner" ON public.brand_products FOR INSERT WITH CHECK (auth.uid() = brand_id);
CREATE POLICY "products_updatable_by_owner" ON public.brand_products FOR UPDATE USING (auth.uid() = brand_id);
CREATE POLICY "products_deletable_by_owner" ON public.brand_products FOR DELETE USING (auth.uid() = brand_id);

GRANT ALL ON public.brand_products TO authenticated;
GRANT ALL ON public.brand_products TO service_role;


-- ==========================================
-- 2. STORAGE BUCKET FIX (The Core Issue)
-- ==========================================
-- Ensure bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Reset Storage Policies
-- Note: 'storage.objects' is a shared table, so we must filter by bucket_id carefully.

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;

-- Re-create Policies with proper checks
-- 1. Anyone can view images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

-- 2. Authenticated users can upload (INSERT)
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- 3. Authenticated users can update/delete (update their own uploads ideally, but simplified for now)
CREATE POLICY "Authenticated users can update images" ON storage.objects FOR UPDATE 
USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete images" ON storage.objects FOR DELETE 
USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

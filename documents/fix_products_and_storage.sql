-- =========================================
-- MASTER FIX: PRODUCTS & STORAGE
-- =========================================

-- 1. Reset and Recreate Products Table
DROP TABLE IF EXISTS public.brand_products CASCADE;

CREATE TABLE public.brand_products (
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

-- 2. Products Table RLS
ALTER TABLE public.brand_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "누구나 제품 조회 가능" ON public.brand_products;
CREATE POLICY "누구나 제품 조회 가능" ON public.brand_products FOR SELECT USING (true);

DROP POLICY IF EXISTS "자신의 제품만 등록 가능" ON public.brand_products;
CREATE POLICY "자신의 제품만 등록 가능" ON public.brand_products FOR INSERT WITH CHECK (auth.uid() = brand_id);

DROP POLICY IF EXISTS "자신의 제품만 수정 가능" ON public.brand_products;
CREATE POLICY "자신의 제품만 수정 가능" ON public.brand_products FOR UPDATE USING (auth.uid() = brand_id);

DROP POLICY IF EXISTS "자신의 제품만 삭제 가능" ON public.brand_products;
CREATE POLICY "자신의 제품만 삭제 가능" ON public.brand_products FOR DELETE USING (auth.uid() = brand_id);

-- 3. Storage Bucket and Policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Access Policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
CREATE POLICY "Authenticated users can update images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;
CREATE POLICY "Authenticated users can delete images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- 4. Final Permissions
GRANT ALL ON public.brand_products TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

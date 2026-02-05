-- =========================================
-- [FINAL FIX] ALL IN ONE SOLUTION
-- This script fixes: 
-- 1. Image Upload Hangs (Storage Permissions)
-- 2. Product Registration Hangs (Insert Permissions)
-- 3. Product Update Hangs (Update Permissions)
-- 4. Login Role Issues (Profile Select Permissions)
-- =========================================

-- PART 1: RESET STORAGE PERMISSIONS (Fixes Image Upload)
-- -----------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Clear all existing storage policies to prevent conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;

-- Re-apply correct policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');


-- PART 2: RESET PRODUCT TABLE PERMISSIONS (Fixes Add/Edit Product)
-- ---------------------------------------------------------------
ALTER TABLE public.brand_products ENABLE ROW LEVEL SECURITY;

-- Clear all existing product policies
DROP POLICY IF EXISTS "누구나 제품 조회 가능" ON public.brand_products;
DROP POLICY IF EXISTS "자신의 제품만 등록 가능" ON public.brand_products;
DROP POLICY IF EXISTS "자신의 제품만 수정 가능" ON public.brand_products;
DROP POLICY IF EXISTS "자신의 제품만 삭제 가능" ON public.brand_products;

-- Re-apply correct policies
CREATE POLICY "누구나 제품 조회 가능" ON public.brand_products FOR SELECT USING (true);
CREATE POLICY "자신의 제품만 등록 가능" ON public.brand_products FOR INSERT WITH CHECK (auth.uid() = brand_id);
-- Update policy: simple check that you are the owner
CREATE POLICY "자신의 제품만 수정 가능" ON public.brand_products FOR UPDATE USING (auth.uid() = brand_id);
CREATE POLICY "자신의 제품만 삭제 가능" ON public.brand_products FOR DELETE USING (auth.uid() = brand_id);


-- PART 3: RESET PROFILE PERMISSIONS (Fixes Login Role & Role Switch)
-- -----------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Clear all existing profile policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Re-apply correct policies
-- Allow everyone to read profiles (needed for discovery)
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
-- Allow users to update their own profile (essential for role switch)
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
-- Allow users to insert (signup)
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);


-- PART 4: GRANT EXECUTION PERMISSIONS (Final Safety Net)
-- -----------------------------------------------------
GRANT ALL ON public.brand_products TO authenticated;
GRANT ALL ON public.brand_products TO service_role;

GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

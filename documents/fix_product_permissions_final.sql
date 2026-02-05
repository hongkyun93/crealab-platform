-- 🚨 긴급 수정: 제품 수정 무한 로딩 및 권한 문제 해결
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요.

-- 1. 테이블 권한 초기화 (기존 정책 모두 제거하여 충돌 방지)
ALTER TABLE public.brand_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_products ENABLE ROW LEVEL SECURITY;

-- 기존 정책 이름이 무엇이든 다 삭제 (영문/한글 혼용 방지)
DROP POLICY IF EXISTS "Brand products are viewable by everyone" ON brand_products;
DROP POLICY IF EXISTS "Brands can insert their own products" ON brand_products;
DROP POLICY IF EXISTS "Brands can update their own products" ON brand_products;
DROP POLICY IF EXISTS "Brands can delete their own products" ON brand_products;
DROP POLICY IF EXISTS "누구나 제품 조회 가능" ON brand_products;
DROP POLICY IF EXISTS "자신의 제품만 등록 가능" ON brand_products;
DROP POLICY IF EXISTS "자신의 제품만 수정 가능" ON brand_products;
DROP POLICY IF EXISTS "자신의 제품만 삭제 가능" ON brand_products;
DROP POLICY IF EXISTS "policy_select_products" ON brand_products;
DROP POLICY IF EXISTS "policy_insert_products" ON brand_products;
DROP POLICY IF EXISTS "policy_update_products" ON brand_products;
DROP POLICY IF EXISTS "policy_delete_products" ON brand_products;

-- 2. 가장 확실하고 단순한 정책 재생성
-- 조회: 누구나 가능
CREATE POLICY "policy_select_products" ON brand_products FOR SELECT USING (true);

-- 등록: 자신의 ID로만 등록 가능 (WITH CHECK)
CREATE POLICY "policy_insert_products" ON brand_products FOR INSERT WITH CHECK (auth.uid() = brand_id);

-- 수정: 자신이 등록한 제품만 수정 가능 (USING)
CREATE POLICY "policy_update_products" ON brand_products FOR UPDATE USING (auth.uid() = brand_id);

-- 삭제: 자신이 등록한 제품만 삭제 가능
CREATE POLICY "policy_delete_products" ON brand_products FOR DELETE USING (auth.uid() = brand_id);

-- 3. 권한 부여 (확실하게 재적용)
GRANT ALL ON public.brand_products TO authenticated;
GRANT ALL ON public.brand_products TO service_role;
GRANT ALL ON public.brand_products TO anon; -- 조회용

-- 4. 스토리지 권한 (이미지 업로드/수정 문제 방지)
-- 스토리지 정책도 초기화 후 재설정
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
CREATE POLICY "storage_update_policy" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "storage_insert_policy" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

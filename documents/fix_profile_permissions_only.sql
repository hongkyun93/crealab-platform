-- 🚨 프로필 업데이트 권한 및 컬럼 긴급 수정
-- 이 스크립트는 'profiles' 테이블만 건드립니다.

-- 1. website 컬럼이 없으면 추가 (브랜드 설정 저장 오류 방지)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website text;

-- 2. 프로필 업데이트 정책 재설정
-- 기존 충돌 가능한 정책 삭제
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

-- 확실한 정책 생성: 본인 ID와 일치하는 행만 수정 가능
CREATE POLICY "profiles_update_policy" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 3. 권한 재부여
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

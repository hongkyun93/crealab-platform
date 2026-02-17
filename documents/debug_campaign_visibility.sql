-- 캠페인 가시성 문제 디버깅
-- 최근 생성된 캠페인 5개 확인

SELECT 
    id,
    product_name,
    brand_id,
    team_id,
    created_at,
    status
FROM campaigns 
ORDER BY created_at DESC 
LIMIT 5;

-- 특정 브랜드 사용자의 캠페인 확인
-- voib@brand.com 의 user id 확인 후 실행
SELECT 
    c.id,
    c.product_name,
    c.brand_id,
    c.team_id,
    p.email as brand_email,
    c.created_at
FROM campaigns c
LEFT JOIN profiles p ON p.id = c.brand_id
ORDER BY c.created_at DESC
LIMIT 10;

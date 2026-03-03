-- workspaces 테이블에 제품명 컬럼 추가 (브랜드 제안 폼에서 동기화)
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS product_name text;

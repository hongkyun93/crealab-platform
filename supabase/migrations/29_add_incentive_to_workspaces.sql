-- conditions JSONB에만 있던 항목들을 workspaces 컬럼으로 승격 + 동기화
ALTER TABLE workspaces
    ADD COLUMN IF NOT EXISTS has_incentive boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS incentive_detail text,
    ADD COLUMN IF NOT EXISTS special_terms text,
    ADD COLUMN IF NOT EXISTS product_url text;

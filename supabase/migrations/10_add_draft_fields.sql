-- 10_add_draft_fields.sql

-- 1. moment_proposals 테이블의 status CHECK 조건에 'draft' 추가
ALTER TABLE public.moment_proposals DROP CONSTRAINT IF EXISTS moment_proposals_status_check;
ALTER TABLE public.moment_proposals ADD CONSTRAINT moment_proposals_status_check CHECK (status = ANY (ARRAY['draft', 'offered', 'pending', 'applied', 'accepted', 'declined', 'negotiating', 'confirmed', 'active', 'in_progress', 'signed', 'shipped', 'started', 'completed', 'settlement', 'final_complete', 'cancelled', 'rejected']));

-- 2. brand_products 테이블에 임시저장을 위한 is_draft 컬럼 추가
ALTER TABLE public.brand_products ADD COLUMN IF NOT EXISTS is_draft boolean DEFAULT false;

-- (campaigns 테이블은 이미 status 속성을 갖고 제약 조건이 없으므로 'draft'를 바로 사용할 수 있습니다)

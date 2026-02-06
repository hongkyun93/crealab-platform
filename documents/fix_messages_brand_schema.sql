
-- messages 테이블에 brand_proposal_id 컬럼 추가 (기존 proposal_id와 별도로 브랜드 제안서를 참조하기 위함)
-- IF NOT EXISTS를 사용하여 기존 구조에 영향을 주지 않음
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS brand_proposal_id UUID REFERENCES brand_proposals(id) ON DELETE SET NULL;

-- 기존 proposal_id가 필수(NOT NULL)였다면, 브랜드 제안서 메시지는 proposal_id가 없을 수 있으므로 NULL 허용으로 변경
ALTER TABLE messages 
ALTER COLUMN proposal_id DROP NOT NULL;

-- 메시지 조회 성능을 위한 인덱스 추가 (선택 사항)
CREATE INDEX IF NOT EXISTS idx_messages_brand_proposal_id ON messages(brand_proposal_id);

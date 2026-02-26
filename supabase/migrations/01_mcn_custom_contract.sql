-- MCN 커스텀 계약서 지원을 위한 스키마 업데이트
-- 대상: teams 테이블

ALTER TABLE public.teams
ADD COLUMN IF NOT EXISTS custom_contract_terms TEXT,
ADD COLUMN IF NOT EXISTS use_custom_contract BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.teams.custom_contract_terms IS 'MCN 자체 전자계약서 (표준 계약서) 본문 내용 (마크다운 또는 일반 텍스트)';
COMMENT ON COLUMN public.teams.use_custom_contract IS '플랫폼 기본 제공 계약서 대신 해당 MCN 자체 계약서를 사용할지 여부';

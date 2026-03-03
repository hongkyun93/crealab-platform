-- 진행 채널 관련 컬럼을 workspaces 테이블에 추가
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS channel_name text;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS channel_subtype text;

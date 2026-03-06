-- Migration 46: teams 테이블에 name 컬럼 추가
-- 목적: teams 테이블에 표시용 팀 이름(name) 컬럼이 없어서
--       get_invitation_by_code RPC가 실패하고 MCN 초대링크가 동작하지 않던 버그 수정.
--       slug는 URL/기계용 식별자, name은 사람이 읽는 팀 이름으로 역할이 다름.

ALTER TABLE public.teams
ADD COLUMN IF NOT EXISTS name text;

-- 기존 팀들은 slug를 name 기본값으로 설정
UPDATE public.teams
SET name = slug
WHERE name IS NULL;

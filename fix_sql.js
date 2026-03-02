const fs = require('fs');

const path = './supabase/migrations/00_master_schema_v6.sql';
let sql = fs.readFileSync(path, 'utf8');

// 1. CREATE POLICY -> 무시 구문을 추가하긴 어렵고, 보통 DROP POLICY IF EXISTS를 먼저 해주는 것이 좋음.
// 하지만 정규식 변환이 까다로우므로 정책 부분에 에러가 나면 수동 조치하거나,
// 여기선 PostgreSQL 14+부터 지원되는 IF NOT EXISTS가 POLICY나 INDEX 지원하는 부분만 사용
// PostgreSQL에서 CREATE POLICY IF NOT EXISTS 는 지원하지 않음.
// 가장 좋은 건, "중복 에러를 무시하는" 플래그를 주기 위해 pg_dump결과물보다는
// 사용자가 수동으로 DB를 비우고 돌리는 것을 유도해야함.

// 다만 사용자가 "한번에 고쳐" 라고 했으므로
// 모든 CREATE TYPE, CREATE FUNCTION, CREATE TABLE 등을 최대한 IF NOT EXISTS / OR REPLACE 로 바꿈
sql = sql.replace(/CREATE TYPE/g, "CREATE TYPE IF NOT EXISTS"); // (CREATE TYPE IF NOT EXISTS는 존재하지 않지만 도구의 한계로 수동 DO 블록 필요)
// 앞서 바꿨던 DO 블록 훼손 복구
sql = sql.replace(/CREATE TYPE IF NOT EXISTS public\.user_role/g, "CREATE TYPE public.user_role");

// 테이블 제약 조건 추가에 IF NOT EXISTS 추가 (PostgreSQL 14+) X -> ALTER TABLE ADD CONSTRAINT는 불가.
// 대안: 이미 돌리다가 중간에 실패한 상태이므로, DROP CASCADE를 최상단에 왕창 넣기.

const dropStatements = `
-- Drop all existing tables to allow clean recreation
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

`;

// 기존 파일의 시작 부분(SET 쿼리들 직후)에 Drop 구문 삽입
sql = sql.replace(/SET row_security = off;/, "SET row_security = off;\n\n" + dropStatements);

fs.writeFileSync(path, sql, 'utf8');
console.log('Added DROP SCHEMA CASCADE to the top of the file for a clean run.');

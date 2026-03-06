-- Supabase SQL 에디터에서 실행:
-- 1) 스키마 캐시 reload + 컬럼 조회 RPC

-- 실제 테이블 컬럼을 pg_catalog에서 가져오는 RPC
CREATE OR REPLACE FUNCTION public.get_table_columns(p_table text)
RETURNS TABLE(column_name text, data_type text, is_nullable text, column_default text)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.attname::text,
    pg_catalog.format_type(a.atttypid, a.atttypmod)::text,
    CASE WHEN a.attnotnull THEN 'NO' ELSE 'YES' END::text,
    pg_catalog.pg_get_expr(d.adbin, d.adrelid)::text
  FROM pg_catalog.pg_attribute a
  LEFT JOIN pg_catalog.pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
  WHERE a.attrelid = (SELECT oid FROM pg_catalog.pg_class WHERE relname = p_table AND relnamespace = 'public'::regnamespace)
    AND a.attnum > 0
    AND NOT a.attisdropped
  ORDER BY a.attnum;
END;
$$;

-- 스키마 cache reload (PostgREST)
SELECT pg_notify('pgrst', 'reload schema');

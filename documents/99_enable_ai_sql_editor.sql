
-- 🤖 AI SQL Executor Function
-- Purpose: Allows the AI Assistant (using Service Role Key) to execute SQL migrations and queries directly.
-- Security: Restricted to 'service_role' only.

CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Security check: Ensure only service_role can execute this
  IF auth.role() != 'service_role' THEN
    RAISE EXCEPTION 'Access denied. Service role required.';
  END IF;

  -- Execute the SQL
  EXECUTE sql;
END;
$$;

-- Grant execution permission only to service_role
REVOKE ALL ON FUNCTION public.exec_sql(text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;

COMMENT ON FUNCTION public.exec_sql IS 'Executes arbitrary SQL. Restricted to service_role.';

-- =====================================================
-- MCN Business Info & Statement Serial Number
-- Created: 2026-02-23
-- Idempotent: safe to run multiple times
-- =====================================================

-- 1. Add missing business info columns to teams
--    (business_registration_number already exists in schema)
ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS representative_name text,
  ADD COLUMN IF NOT EXISTS business_address    text,
  ADD COLUMN IF NOT EXISTS stamp_url           text;

-- 2. Add statement_number to settlements for sequential numbering
ALTER TABLE public.settlements
  ADD COLUMN IF NOT EXISTS statement_number text;

-- 3. Function: generate sequential statement number (YYYYMM-XXXXX)
--    Called when marking a settlement as paid, or on demand
CREATE OR REPLACE FUNCTION public.generate_statement_number(
  target_team_id uuid,
  target_month   text  -- 'YYYY-MM'
)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  seq integer;
  result text;
BEGIN
  -- Count how many statements already have a number for this team+month
  SELECT COUNT(*) + 1 INTO seq
  FROM public.settlements
  WHERE team_id = target_team_id
    AND settlement_month = target_month
    AND statement_number IS NOT NULL;

  result := replace(target_month, '-', '') || '-' || lpad(seq::text, 5, '0');
  RETURN result;
END;
$$;

-- 4. RLS: allow team members to READ teams row (for business info)
--    The existing teams RLS may already allow this; use IF NOT EXISTS guard
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'teams'
      AND policyname = 'teams_members_select'
  ) THEN
    CREATE POLICY "teams_members_select" ON public.teams
      FOR SELECT USING (
        id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
      );
  END IF;
END $$;

-- 5. RLS: allow team owner/admin to UPDATE teams (for business info)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'teams'
      AND policyname = 'teams_owner_update'
  ) THEN
    CREATE POLICY "teams_owner_update" ON public.teams
      FOR UPDATE USING (
        id IN (
          SELECT team_id FROM public.team_members
          WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
      );
  END IF;
END $$;

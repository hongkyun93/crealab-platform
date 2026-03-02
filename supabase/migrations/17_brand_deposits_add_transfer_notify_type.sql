-- Migration: Fix admin RLS policies for workspaces + brand_deposits transfer_notify
-- Fixes:
--   1. [Admin] workspaces error: {} — admin SELECT RLS missing on workspaces
--   2. notify transfer failed: {} — brand_deposits type check blocks 'transfer_notify'

-- ══════════════════════════════════════════════════════════════
-- 1. WORKSPACES: Admin SELECT policy (idempotent)
-- ══════════════════════════════════════════════════════════════
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'workspaces' AND policyname = 'admin_read_workspaces'
    ) THEN
        CREATE POLICY admin_read_workspaces ON public.workspaces
            FOR SELECT USING (public.is_admin());
    END IF;
END $$;

-- ══════════════════════════════════════════════════════════════
-- 2. BRAND_DEPOSITS: Add 'transfer_notify' to type check constraint
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.brand_deposits
    DROP CONSTRAINT IF EXISTS brand_deposits_type_check;

ALTER TABLE public.brand_deposits
    ADD CONSTRAINT brand_deposits_type_check
    CHECK (type = ANY (ARRAY['charge'::text, 'use'::text, 'refund'::text, 'transfer_notify'::text]));

-- ══════════════════════════════════════════════════════════════
-- 3. BRAND_DEPOSITS: Update INSERT RLS to allow 'transfer_notify'
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS brand_deposits_insert_own ON public.brand_deposits;
DROP POLICY IF EXISTS brand_deposits_insert ON public.brand_deposits;

-- Brand can insert charge/use/transfer_notify for their own account
CREATE POLICY brand_deposits_insert_own ON public.brand_deposits
    FOR INSERT WITH CHECK (
        (brand_id = auth.uid()) AND
        (type = ANY (ARRAY['charge'::text, 'use'::text, 'transfer_notify'::text]))
    );

-- General insert: own brand_id or admin
CREATE POLICY brand_deposits_insert ON public.brand_deposits
    FOR INSERT WITH CHECK (
        (auth.uid() = brand_id) OR public.is_admin()
    );

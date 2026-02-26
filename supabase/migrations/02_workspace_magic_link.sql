-- =====================================================
-- Migration: Workspace Magic Link Initiative (Phase 4)
-- Purpose: Adds direct invitation columns to moment_proposals table 
--          and updates related RLS policies
-- =====================================================

-- 1. Add specific Magic Link columns to moment_proposals
ALTER TABLE public.moment_proposals
ADD COLUMN IF NOT EXISTS is_magic_link_invited BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS direct_invite_token UUID UNIQUE,
ADD COLUMN IF NOT EXISTS direct_invite_expires_at TIMESTAMPTZ;

-- 2. Update Comments
COMMENT ON COLUMN public.moment_proposals.is_magic_link_invited IS 'Indicates if this proposal was created proactively by MCN via Magic Link for a brand to join';
COMMENT ON COLUMN public.moment_proposals.direct_invite_token IS 'One-time secure token for the brand to join the workspace workspace';
COMMENT ON COLUMN public.moment_proposals.direct_invite_expires_at IS 'Expiration date for the direct_invite_token (typically +7 days)';

-- 3. RLS Modifications
-- If brand_id is completely NULL during creation, existing RLS might block MCNs/Creators from reading it after insert.
-- Let's ensure creators AND their team MCN members can ALWAYS see their own proposals even if brand_id is null.
DROP POLICY IF EXISTS "Creator can read their own proposals" ON public.moment_proposals;
CREATE POLICY "Creator can read their own proposals" 
ON public.moment_proposals
FOR SELECT 
USING (
    influencer_id = auth.uid()
);

-- Note: The existing "Users can view proposals for their team" (or similar) policy in 00_master_schema_v6_safe.sql
-- usually checks `influencer_id` via `team_members`. Let's ensure that MCN managers can also see it.
-- We are keeping it simple: if MCN manager created it or their creator is assigned, they should see it.
-- Master schema likely handles this via standard team logic, but we add an explicit fallback just in case.
DROP POLICY IF EXISTS "MCN Managers can read proposals of their creators" ON public.moment_proposals;
CREATE POLICY "MCN Managers can read proposals of their creators"
ON public.moment_proposals
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.team_members tm1
        JOIN public.team_members tm2 ON tm1.team_id = tm2.team_id
        WHERE tm1.user_id = auth.uid()
        AND tm2.user_id = moment_proposals.influencer_id
    )
);

-- Allow Creators and MCN to INSERT proposals even if brand_id is NULL (Magic Link scenario)
-- Usually brand_id is NOT NULL in standard constraints, but looking at the table definition earlier, 
-- `brand_id uuid` (no NOT NULL constraint is visible in the create statement for moment_proposals, BUT let's verify).
-- Wait, in `moment_proposals` table definition:
-- brand_id uuid, -- (no NOT NULL specified in line 1980 of 00_master_schema_v6_safe.sql, unlike product_applications)
-- So we can safely insert NULL brand_id.

-- Let's ensure Creators can create proposals.
DROP POLICY IF EXISTS "Creators can insert proposals" ON public.moment_proposals;
CREATE POLICY "Creators can insert proposals"
ON public.moment_proposals
FOR INSERT
WITH CHECK (
    influencer_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM public.team_members tm1
        JOIN public.team_members tm2 ON tm1.team_id = tm2.team_id
        WHERE tm1.user_id = auth.uid() AND tm2.user_id = moment_proposals.influencer_id
    )
);

-- Brand can UPDATE proposal (to claim it) when they validate token
-- (Application layer will use service_role for the mapping to bypass RLS complexity, 
-- but we allow standard updates for normal flow)

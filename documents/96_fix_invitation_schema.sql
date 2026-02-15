-- Migration: Fix Team Invitations Schema for Link Generation
-- Description: Adds `invite_code`, makes `email` nullable, and updates RLS to allow validating invitations.

-- 1. Alter Table
ALTER TABLE public.team_invitations 
ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE,
ALTER COLUMN email DROP NOT NULL;

-- 2. Add Index for performance
CREATE INDEX IF NOT EXISTS idx_team_invitations_invite_code ON public.team_invitations(invite_code);

-- 3. Update RLS Policies
-- We need to allow anyone (authenticated or anon) to read invitations to validate the code.
-- Previous policy 'Members view team invitations' only allowed team members.

DROP POLICY IF EXISTS "Public view invitations" ON public.team_invitations;
CREATE POLICY "Public view invitations" ON public.team_invitations
  FOR SELECT USING (true);

-- Ensure managers can still create/update/delete as before (existing policies should hold, but we double check insert)
-- The existing 'Managers create invitations' policy checks team_members. This is fine for creation.

-- Refresh Schema Cache
NOTIFY pgrst, 'reload schema';

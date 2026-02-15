-- Migration: Rename invited_by to created_by in team_invitations
-- Description: Align database schema with application code usage.

ALTER TABLE public.team_invitations 
RENAME COLUMN invited_by TO created_by;

-- Refresh Schema Cache
NOTIFY pgrst, 'reload schema';

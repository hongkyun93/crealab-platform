-- Fix existing invitations that don't have invite_code
UPDATE public.team_invitations
SET invite_code = substring(md5(random()::text || id::text) from 1 for 12)
WHERE invite_code IS NULL;

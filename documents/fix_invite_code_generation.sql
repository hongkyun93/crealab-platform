-- Fix 1: Create trigger to auto-generate invite_code for new invitations
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invite_code IS NULL THEN
        NEW.invite_code := substring(md5(random()::text || NEW.email || now()::text) from 1 for 12);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_invite_code ON public.team_invitations;
CREATE TRIGGER ensure_invite_code
BEFORE INSERT ON public.team_invitations
FOR EACH ROW
EXECUTE FUNCTION generate_invite_code();

-- Fix 2: Backfill existing NULL invite codes
UPDATE public.team_invitations
SET invite_code = substring(md5(random()::text || id::text || email) from 1 for 12)
WHERE invite_code IS NULL;

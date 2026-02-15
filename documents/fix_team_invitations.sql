-- 1. Create team_invitations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.team_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    invited_by UUID REFERENCES public.profiles(id),
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
    UNIQUE(team_id, email)
);

CREATE INDEX IF NOT EXISTS idx_team_invitations_team_id ON public.team_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON public.team_invitations(email);

-- Enable RLS
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Policies for team_invitations
DROP POLICY IF EXISTS "Members view team invitations" ON public.team_invitations;
CREATE POLICY "Members view team invitations" ON public.team_invitations
  FOR SELECT USING (
    team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Managers create invitations" ON public.team_invitations;
CREATE POLICY "Managers create invitations" ON public.team_invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = team_invitations.team_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager')
    )
  );


-- 2. Backfill Teams for Users who don't have one (Safety Net)
-- This block finds profiles that are NOT in team_members as 'owner' 
-- and creates a team for them.
DO $$ 
DECLARE 
    r RECORD;
    new_team_id UUID;
    v_slug TEXT;
BEGIN
    FOR r IN 
        SELECT p.id, p.display_name, p.avatar_url, p.email
        FROM public.profiles p
        WHERE NOT EXISTS (
            SELECT 1 FROM public.team_members tm 
            WHERE tm.user_id = p.id AND tm.role = 'owner'
        )
        AND p.user_type IN ('mcn', 'agency', 'brand', 'creator') -- Target specific roles or all
    LOOP
        -- Generate simple slug
        v_slug := lower(regexp_replace(COALESCE(r.display_name, 'user'), '[^a-zA-Z0-9]', '', 'g')) || '-' || substring(md5(random()::text) from 1 for 6);
        
        -- Create Team
        INSERT INTO public.teams (name, slug, logo_url, created_by)
        VALUES (
            COALESCE(r.display_name, 'Team'), 
            v_slug, 
            r.avatar_url,
            r.id
        )
        RETURNING id INTO new_team_id;

        -- Add as Owner
        INSERT INTO public.team_members (team_id, user_id, role)
        VALUES (new_team_id, r.id, 'owner');
        
        RAISE NOTICE 'Created missing team for user: % (%)', r.display_name, r.id;
    END LOOP;
END $$;

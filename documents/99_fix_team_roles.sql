-- Migration: Fix Team Roles & Constraints
-- Purpose: 
-- 1. Update 'join_team_with_code' RPC to respect invitation role (instead of hardcoded 'member').
-- 2. Relax CHECK constraints on 'team_members' and 'team_invitations' to allow 'creator', 'manager', 'employee'.

-- 1. Drop existing constraints if they exist (safe due to IF EXISTS)
DO $$ BEGIN
    ALTER TABLE public.team_members DROP CONSTRAINT IF EXISTS team_members_role_check;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.team_invitations DROP CONSTRAINT IF EXISTS team_invitations_role_check;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- 2. Add new constraints with expanded roles
ALTER TABLE public.team_members 
ADD CONSTRAINT team_members_role_check 
CHECK (role IN ('owner', 'admin', 'member', 'creator', 'manager', 'employee'));

ALTER TABLE public.team_invitations 
ADD CONSTRAINT team_invitations_role_check 
CHECK (role IN ('owner', 'admin', 'member', 'creator', 'manager', 'employee'));

-- 3. Update join_team_with_code RPC to respect invitation role
CREATE OR REPLACE FUNCTION public.join_team_with_code(code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (postgres/service_role)
AS $$
DECLARE
  v_invite record;
  v_team_id uuid;
  v_user_id uuid;
  v_existing_member record;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Validate Invite Code
  SELECT * INTO v_invite
  FROM public.team_invitations
  WHERE invite_code = code;

  IF v_invite IS NULL THEN
    RAISE EXCEPTION 'Invalid invitation code';
  END IF;

  IF v_invite.expires_at < now() THEN
    RAISE EXCEPTION 'Invitation expired';
  END IF;

  v_team_id := v_invite.team_id;

  -- 2. Check if already a member
  SELECT * INTO v_existing_member
  FROM public.team_members
  WHERE team_id = v_team_id AND user_id = v_user_id;

  IF v_existing_member IS NOT NULL THEN
    RETURN jsonb_build_object('success', true, 'message', 'Already a member', 'team_id', v_team_id);
  END IF;

  -- 3. Insert into team_members (USING INTIVATION ROLE)
  -- If v_invite.role is null, default to 'member'
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (v_team_id, v_user_id, COALESCE(v_invite.role, 'member'));

  -- 4. Return success
  RETURN jsonb_build_object('success', true, 'message', 'Joined successfully', 'team_id', v_team_id);
END;
$$;

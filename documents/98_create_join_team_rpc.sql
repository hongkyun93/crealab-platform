-- Migration: Create join_team_with_code RPC
-- Purpose: Allow users to join a team securely using an invite code, bypassing RLS on team_members.

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

  -- 3. Insert into team_members
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (v_team_id, v_user_id, 'member');

  -- 4. Return success
  RETURN jsonb_build_object('success', true, 'message', 'Joined successfully', 'team_id', v_team_id);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.join_team_with_code(text) TO authenticated;

-- Refresh Schema Cache
NOTIFY pgrst, 'reload schema';

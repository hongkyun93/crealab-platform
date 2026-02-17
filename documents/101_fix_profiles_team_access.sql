-- Migration: Add Team Access to Profiles Table
-- Purpose: Allow MCN managers to update their team members' profiles
-- This was missing from previous MCN migrations

-- Update profiles UPDATE policy to allow team managers
DROP POLICY IF EXISTS "Self update profiles" ON public.profiles;

CREATE POLICY "Self update profiles" ON public.profiles 
FOR UPDATE USING (
  -- Self
  auth.uid() = id
  OR
  -- Team managers can update profiles of team members
  EXISTS (
    SELECT 1 FROM team_members tm_target
    JOIN team_members tm_auth ON tm_target.team_id = tm_auth.team_id
    WHERE tm_target.user_id = profiles.id
    AND tm_auth.user_id = auth.uid()
    AND tm_auth.role IN ('owner', 'admin', 'manager')
  )
);
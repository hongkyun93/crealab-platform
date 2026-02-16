-- RPC: Add Team Member Directly (No Invitation Required)
CREATE OR REPLACE FUNCTION public.add_team_member_direct(
    target_email TEXT,
    target_role TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id UUID;
    target_user_id UUID;
    user_team_id UUID;
    is_authorized BOOLEAN;
BEGIN
    current_user_id := auth.uid();
    
    -- 1. Get current user's team
    SELECT team_id INTO user_team_id 
    FROM public.team_members 
    WHERE user_id = current_user_id 
    LIMIT 1;
    
    IF user_team_id IS NULL THEN
        -- Check if user created a team
        SELECT id INTO user_team_id 
        FROM public.teams 
        WHERE created_by = current_user_id 
        LIMIT 1;
    END IF;
    
    IF user_team_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', '소속된 팀이 없습니다.');
    END IF;
    
    -- 2. Check permissions (must be owner/manager/admin OR team creator)
    SELECT EXISTS (
        SELECT 1 FROM public.team_members 
        WHERE team_id = user_team_id 
        AND user_id = current_user_id 
        AND role IN ('owner', 'manager', 'admin')
    ) OR EXISTS (
        SELECT 1 FROM public.teams
        WHERE id = user_team_id
        AND created_by = current_user_id
    ) INTO is_authorized;
    
    IF NOT is_authorized THEN
        RETURN jsonb_build_object('success', false, 'message', '팀원 추가 권한이 없습니다.');
    END IF;
    
    -- 3. Find target user by email
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = target_email;
    
    IF target_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', '해당 이메일의 사용자를 찾을 수 없습니다. 먼저 가입이 필요합니다.');
    END IF;
    
    -- 4. Check if already a member
    IF EXISTS (
        SELECT 1 FROM public.team_members 
        WHERE team_id = user_team_id 
        AND user_id = target_user_id
    ) THEN
        RETURN jsonb_build_object('success', false, 'message', '이미 팀 멤버입니다.');
    END IF;
    
    -- 5. Remove from any existing teams (enforce single team membership)
    DELETE FROM public.team_members WHERE user_id = target_user_id;
    
    -- 6. Add to team
    INSERT INTO public.team_members (team_id, user_id, role)
    VALUES (user_team_id, target_user_id, target_role);
    
    RETURN jsonb_build_object('success', true, 'message', '팀원이 추가되었습니다.');
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'message', '오류 발생: ' || SQLERRM);
END;
$$;

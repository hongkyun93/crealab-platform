-- Migration 49: Instagram 연동 저장 RPC (save_instagram_connection)
-- social_channels 테이블에 IG 계정 정보를 저장하는 SECURITY DEFINER 함수.
-- anon key로 호출하므로 RLS 우회가 필수.

CREATE OR REPLACE FUNCTION public.save_instagram_connection(
    p_user_id        uuid,
    p_handle         text,
    p_followers_count integer,
    p_ig_user_id     text,
    p_ig_access_token text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- 기존 instagram 채널 삭제 후 재삽입 (handle이 바뀌면 unique 충돌 방지)
    DELETE FROM public.social_channels
    WHERE user_id = p_user_id AND platform = 'instagram';

    INSERT INTO public.social_channels (
        user_id, platform, handle, followers_count,
        is_primary, is_public, ig_user_id, ig_access_token
    ) VALUES (
        p_user_id, 'instagram', p_handle, p_followers_count,
        true, true, p_ig_user_id, p_ig_access_token
    );

    -- profiles 테이블의 instagram_handle, followers_count도 동기화
    UPDATE public.profiles
    SET
        instagram_handle  = p_handle,
        followers_count   = p_followers_count,
        updated_at        = NOW()
    WHERE id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_instagram_connection(uuid, text, integer, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.save_instagram_connection(uuid, text, integer, text, text) TO authenticated;


-- ─────────────────────────────────────────────────────────────────
-- save_instagram_connection_basic: 팔로워 수 없이 기본 정보만 저장
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.save_instagram_connection_basic(
    p_user_id        uuid,
    p_handle         text,
    p_ig_user_id     text,
    p_ig_access_token text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    DELETE FROM public.social_channels
    WHERE user_id = p_user_id AND platform = 'instagram';

    INSERT INTO public.social_channels (
        user_id, platform, handle,
        is_primary, is_public, ig_user_id, ig_access_token
    ) VALUES (
        p_user_id, 'instagram', p_handle,
        true, true, p_ig_user_id, p_ig_access_token
    );

    UPDATE public.profiles
    SET
        instagram_handle = p_handle,
        updated_at       = NOW()
    WHERE id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_instagram_connection_basic(uuid, text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.save_instagram_connection_basic(uuid, text, text, text) TO authenticated;

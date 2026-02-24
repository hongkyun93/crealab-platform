-- =====================================================
-- save_instagram_connection: SECURITY DEFINER 함수
-- anon key로 호출 가능. RLS 우회하여 social_channels 저장.
-- Created: 2026-02-24
-- =====================================================

CREATE OR REPLACE FUNCTION public.save_instagram_connection(
  p_user_id uuid,
  p_handle text,
  p_followers_count integer,
  p_ig_user_id text,
  p_ig_access_token text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
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
END;
$$;

-- anon, authenticated 롤에 실행 권한 부여
GRANT EXECUTE ON FUNCTION public.save_instagram_connection TO anon;
GRANT EXECUTE ON FUNCTION public.save_instagram_connection TO authenticated;

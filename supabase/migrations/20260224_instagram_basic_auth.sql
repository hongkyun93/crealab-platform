-- Function to save Instagram Basic Display API connection info
CREATE OR REPLACE FUNCTION public.save_instagram_connection_basic(
    p_user_id UUID,
    p_handle TEXT,
    p_ig_user_id TEXT,
    p_ig_access_token TEXT
) RETURNS void AS $$
DECLARE
    v_platform text := 'instagram';
    v_existing_id uuid;
BEGIN
    -- Check if social channel already exists for this platform
    SELECT id INTO v_existing_id
    FROM public.social_channels
    WHERE user_id = p_user_id AND platform = v_platform
    LIMIT 1;

    IF v_existing_id IS NOT NULL THEN
        -- Update existing channel
        UPDATE public.social_channels
        SET 
            handle = p_handle,
            ig_user_id = p_ig_user_id,
            ig_access_token = p_ig_access_token,
            updated_at = NOW()
        WHERE id = v_existing_id;
    ELSE
        -- Insert new channel (followers count cannot be retrieved from Basic Display API easily, default to 0)
        INSERT INTO public.social_channels (
            user_id,
            platform,
            handle,
            followers_count,
            ig_user_id,
            ig_access_token,
            is_primary,
            is_public
        ) VALUES (
            p_user_id,
            v_platform,
            p_handle,
            0,
            p_ig_user_id,
            p_ig_access_token,
            false,
            true
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

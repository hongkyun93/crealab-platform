DO $$
DECLARE
    row record;
BEGIN
    FOR row IN SELECT id, email, raw_user_meta_data FROM auth.users
    LOOP
        INSERT INTO public.profiles (id, email, display_name, avatar_url, role)
        VALUES (
            row.id, 
            row.email, 
            COALESCE(row.raw_user_meta_data->>'full_name', row.raw_user_meta_data->>'name', split_part(row.email, '@', 1)),
            row.raw_user_meta_data->>'avatar_url',
            COALESCE(row.raw_user_meta_data->>'role', 'creator')
        )
        ON CONFLICT (id) DO NOTHING;
    END LOOP;
END $$;

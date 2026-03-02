DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'shipping_name'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN shipping_name text;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'shipping_phone'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN shipping_phone text;
    END IF;
END $$;

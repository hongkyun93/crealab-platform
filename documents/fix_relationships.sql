-- 🔍 FIX RELATIONSHIPS & SCHEMA CACHE
-- Run this script to restore missing Foreign Keys and refresh PostgREST cache.

-- 1. Explicitly recreate Foreign Key for brand_products -> profiles
DO $$
BEGIN
    -- Check if constraint exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'brand_products_brand_id_fkey'
    ) THEN
        ALTER TABLE public.brand_products 
        ADD CONSTRAINT brand_products_brand_id_fkey 
        FOREIGN KEY (brand_id) 
        REFERENCES public.profiles(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Explicitly recreate Foreign Key for life_moments -> profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'life_moments_influencer_id_fkey'
    ) THEN
        ALTER TABLE public.life_moments 
        ADD CONSTRAINT life_moments_influencer_id_fkey 
        FOREIGN KEY (influencer_id) 
        REFERENCES public.profiles(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Ensure profiles are publicly viewable (Crucial for joins)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);

-- 4. Grant Select Permissions
GRANT SELECT ON public.brand_products TO anon, authenticated;
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT SELECT ON public.life_moments TO anon, authenticated;

-- 5. Force Schema Cache Reload (Crucial step)
NOTIFY pgrst, 'reload schema';

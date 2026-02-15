-- Migration: Ensure favorites table exists and has correct schema
-- This script is idempotent (safe to run multiple times)

-- Step 1: Create table if not exists
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    target_id UUID NOT NULL, -- Flexible ID for Product, Campaign, or Profile
    target_type TEXT NOT NULL, -- 'product', 'campaign', 'profile', 'event'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Prevent duplicate favorites
    CONSTRAINT favorites_user_id_target_id_target_type_key UNIQUE(user_id, target_id, target_type)
);

-- Step 2: Add check constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_target_type'
    ) THEN
        ALTER TABLE public.favorites ADD CONSTRAINT check_target_type CHECK (target_type IN ('product', 'campaign', 'profile', 'event'));
    END IF;
END $$;

-- Step 3: Enable RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Step 4: Recreate policies to ensure they are correct (DROP IF EXISTS then CREATE)
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorites;

CREATE POLICY "Users can view their own favorites" 
ON public.favorites FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" 
ON public.favorites FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
ON public.favorites FOR DELETE 
USING (auth.uid() = user_id);

-- Step 5: Enable Realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'favorites'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.favorites;
  END IF;
END $$;

-- Step 6: Create index for performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_target ON public.favorites(target_id, target_type);

SELECT 'Favorites table ensured' as status;

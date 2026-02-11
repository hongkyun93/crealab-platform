-- Migration: Ensure life_moments has all necessary columns
-- This script adds missing columns and drops the old influencer_events table

-- Step 1: Add all necessary columns to life_moments if they don't exist
ALTER TABLE public.life_moments ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.life_moments ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.life_moments ADD COLUMN IF NOT EXISTS target_product TEXT;
ALTER TABLE public.life_moments ADD COLUMN IF NOT EXISTS event_date TEXT;
ALTER TABLE public.life_moments ADD COLUMN IF NOT EXISTS posting_date TEXT;
ALTER TABLE public.life_moments ADD COLUMN IF NOT EXISTS date_flexible BOOLEAN DEFAULT FALSE;
ALTER TABLE public.life_moments ADD COLUMN IF NOT EXISTS guide TEXT;
ALTER TABLE public.life_moments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'recruiting';
ALTER TABLE public.life_moments ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE;
ALTER TABLE public.life_moments ADD COLUMN IF NOT EXISTS is_mock BOOLEAN DEFAULT FALSE;
ALTER TABLE public.life_moments ADD COLUMN IF NOT EXISTS schedule JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.life_moments ADD COLUMN IF NOT EXISTS price_video INTEGER;
ALTER TABLE public.life_moments ADD COLUMN IF NOT EXISTS influencer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.life_moments ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.life_moments ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.life_moments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.life_moments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Step 2: Enable RLS if not already enabled
ALTER TABLE public.life_moments ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop old policies if they exist and create new ones
DROP POLICY IF EXISTS "Influencer events are viewable by everyone" ON life_moments;
DROP POLICY IF EXISTS "Influencers can insert their own events" ON life_moments;
DROP POLICY IF EXISTS "Influencers can update their own events" ON life_moments;
DROP POLICY IF EXISTS "Influencers can delete their own events" ON life_moments;
DROP POLICY IF EXISTS "Life moments are viewable by everyone" ON life_moments;
DROP POLICY IF EXISTS "Users can insert their own life moments" ON life_moments;
DROP POLICY IF EXISTS "Users can update their own life moments" ON life_moments;
DROP POLICY IF EXISTS "Users can delete their own life moments" ON life_moments;

CREATE POLICY "Life moments are viewable by everyone" 
    ON life_moments FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert their own life moments" 
    ON life_moments FOR INSERT 
    WITH CHECK (auth.uid() = influencer_id);

CREATE POLICY "Users can update their own life moments" 
    ON life_moments FOR UPDATE 
    USING (auth.uid() = influencer_id);

CREATE POLICY "Users can delete their own life moments" 
    ON life_moments FOR DELETE 
    USING (auth.uid() = influencer_id);

-- Step 4: Enable Realtime
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'life_moments'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE life_moments;
        RAISE NOTICE 'Added life_moments to realtime publication';
    END IF;
END $$;

-- Step 5: Update foreign key references in brand_proposals
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'brand_proposals' 
        AND column_name = 'event_id'
    ) THEN
        ALTER TABLE public.brand_proposals 
        DROP CONSTRAINT IF EXISTS brand_proposals_event_id_fkey;
        
        ALTER TABLE public.brand_proposals 
        ADD CONSTRAINT brand_proposals_event_id_fkey 
        FOREIGN KEY (event_id) 
        REFERENCES public.life_moments(id) 
        ON DELETE CASCADE;
        
        RAISE NOTICE 'Updated brand_proposals foreign key to reference life_moments';
    END IF;
END $$;

-- Step 6: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_life_moments_influencer_id ON public.life_moments(influencer_id);
CREATE INDEX IF NOT EXISTS idx_life_moments_created_at ON public.life_moments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_life_moments_status ON public.life_moments(status);
CREATE INDEX IF NOT EXISTS idx_life_moments_is_private ON public.life_moments(is_private);

-- Step 7: Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_life_moments_updated_at ON public.life_moments;
CREATE TRIGGER update_life_moments_updated_at
    BEFORE UPDATE ON public.life_moments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Drop old influencer_events table if it exists
DROP TABLE IF EXISTS public.influencer_events CASCADE;

-- Migration complete
SELECT 'Migration to life_moments completed successfully!' AS status;

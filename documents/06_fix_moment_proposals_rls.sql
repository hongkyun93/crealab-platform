
-- Fix missing RLS policies for moment_proposals table
-- This table was likely created recently and missed the standard RLS setup

-- 1. Enable RLS
ALTER TABLE public.moment_proposals ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own moment proposals" ON public.moment_proposals;
DROP POLICY IF EXISTS "Users can insert moment proposals" ON public.moment_proposals;
DROP POLICY IF EXISTS "Users can update their own moment proposals" ON public.moment_proposals;
DROP POLICY IF EXISTS "Users can delete their own moment proposals" ON public.moment_proposals;

-- 3. Create policies

-- VIEW: Brand or Influencer can see rows where they are invalid
CREATE POLICY "Users can view their own moment proposals" 
ON public.moment_proposals FOR SELECT 
USING ( 
    auth.uid() = brand_id OR 
    auth.uid() = influencer_id 
);

-- INSERT: Authenticated users can insert (usually Brand proposing to Moment)
-- We check that the user creating the row is one of the parties (usually brand_id)
CREATE POLICY "Users can insert moment proposals" 
ON public.moment_proposals FOR INSERT 
WITH CHECK ( 
    auth.uid() = brand_id OR 
    auth.uid() = influencer_id 
);

-- UPDATE: Both parties need to be able to update status cases
CREATE POLICY "Users can update their own moment proposals" 
ON public.moment_proposals FOR UPDATE 
USING ( 
    auth.uid() = brand_id OR 
    auth.uid() = influencer_id 
);

-- DELETE: Both parties can delete (or archive)
CREATE POLICY "Users can delete their own moment proposals" 
ON public.moment_proposals FOR DELETE 
USING ( 
    auth.uid() = brand_id OR 
    auth.uid() = influencer_id 
);

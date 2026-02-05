-- 🛠️ FIX PROPOSAL PERMISSIONS & SCHEMA (V3)
-- Run this to fix "Permission Denied" errors when sending proposals

-- 1. Enable RLS (Just in case)
ALTER TABLE public.brand_proposals ENABLE ROW LEVEL SECURITY;

-- 2. RESET POLICIES (Fixing the bug where only Brands could insert)
DROP POLICY IF EXISTS "Brands can create proposals" ON brand_proposals;
DROP POLICY IF EXISTS "Users can create proposals" ON brand_proposals;
DROP POLICY IF EXISTS "Brand proposals viewable by sender and receiver" ON brand_proposals;
DROP POLICY IF EXISTS "Parties can update status" ON brand_proposals;
DROP POLICY IF EXISTS "Receiver can update status" ON brand_proposals;
DROP POLICY IF EXISTS "Brands can delete proposals" ON brand_proposals;

-- A. VIEW: Sender or Receiver can see it
CREATE POLICY "Brand proposals viewable by sender and receiver" ON brand_proposals 
FOR SELECT USING ( 
    auth.uid() = brand_id OR auth.uid() = influencer_id 
);

-- B. INSERT: Sender can be Brand OR Influencer
-- Critical Fix: Allow insert if you are EITHER the brand_id OR the influencer_id
CREATE POLICY "Users can create proposals" ON brand_proposals 
FOR INSERT WITH CHECK ( 
    auth.uid() = brand_id OR auth.uid() = influencer_id 
);

-- C. UPDATE: Sender or Receiver can update (e.g. status)
CREATE POLICY "Parties can update status" ON brand_proposals 
FOR UPDATE USING ( 
    auth.uid() = brand_id OR auth.uid() = influencer_id 
);

-- D. DELETE: For now, allow Brand (or maybe both? sticking to Brand for safety)
CREATE POLICY "Brands can delete proposals" ON brand_proposals 
FOR DELETE USING ( 
    auth.uid() = brand_id 
);

-- 3. SCHEMA UPDATES (Add missing columns for better data)
DO $$
BEGIN
    -- Add event_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brand_proposals' AND column_name = 'event_id') THEN
        ALTER TABLE public.brand_proposals ADD COLUMN event_id uuid references public.influencer_events(id);
    END IF;

    -- Add product_id if missing (Links to brand_products)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brand_proposals' AND column_name = 'product_id') THEN
        ALTER TABLE public.brand_proposals ADD COLUMN product_id uuid references public.brand_products(id);
    END IF;
END $$;

-- 4. RELAX CONSTRAINTS (Prevent errors with 'applied' vs 'offered')
ALTER TABLE public.brand_proposals DROP CONSTRAINT IF EXISTS brand_proposals_status_check;
ALTER TABLE public.brand_proposals DROP CONSTRAINT IF EXISTS brand_proposals_product_type_check;

-- 5. RELOAD SCHEMA CACHE (By notifying pgrst - not always needed but good practice)
NOTIFY pgrst, 'reload schema';

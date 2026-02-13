
-- 1. Drop Legacy Tables with CASCADE (Removes dependent constraints)
DROP TABLE IF EXISTS public.proposals CASCADE;
DROP TABLE IF EXISTS public.influencer_events CASCADE;

-- 2. Repair Constraints for submission_feedback
-- The drop of 'proposals' might have removed the 'submission_feedback_proposal_id_fkey'
-- We must ensure it exists and points to 'campaign_proposals'
DO $$ BEGIN
    -- Only add if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'submission_feedback_proposal_id_fkey') THEN
        ALTER TABLE public.submission_feedback 
        ADD CONSTRAINT submission_feedback_proposal_id_fkey 
        FOREIGN KEY (proposal_id) REFERENCES public.campaign_proposals(id) ON DELETE CASCADE;
    END IF;
EXCEPTION
    WHEN undefined_table THEN NULL; -- Ignore if table doesn't exist
    WHEN duplicate_object THEN NULL;
END $$;

-- 3. Repair Constraints for brand_proposals
-- The drop of 'influencer_events' might have removed 'brand_proposals_event_id_fkey'
-- We must ensure it exists and points to 'life_moments'
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'brand_proposals_event_id_fkey') THEN
        -- Check if event_id column exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brand_proposals' AND column_name = 'event_id') THEN
             ALTER TABLE public.brand_proposals 
             ADD CONSTRAINT brand_proposals_event_id_fkey 
             FOREIGN KEY (event_id) REFERENCES public.life_moments(id) ON DELETE SET NULL;
        END IF;
    END IF;
EXCEPTION
    WHEN undefined_table THEN NULL;
    WHEN duplicate_object THEN NULL; 
END $$;

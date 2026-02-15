-- ==========================================
-- Migration 93: Rename ALL Influencer to Creator
-- ==========================================
-- This migration renames:
-- 1. Role values: 'influencer' → 'creator'
-- 2. Table names: influencer_details → creator_details
-- 3. Column names: influencer_id → creator_id, etc.
-- ==========================================

-- PHASE 1: Update Role Values
-- ==========================================

-- Update profiles.role
UPDATE public.profiles  
SET role = 'creator'
WHERE role = 'influencer';

-- Update profiles.user_type  
UPDATE public.profiles
SET user_type = 'creator'
WHERE user_type = 'influencer';

-- Update default value
ALTER TABLE public.profiles 
ALTER COLUMN user_type SET DEFAULT 'creator';


-- PHASE 2: Rename Table
-- ==========================================

ALTER TABLE public.influencer_details RENAME TO creator_details;


-- PHASE 3: Rename Columns in life_moments
-- ==========================================

ALTER TABLE public.life_moments 
RENAME COLUMN influencer_id TO creator_id;


-- PHASE 4: Rename Columns in brand_proposals
-- ==========================================

ALTER TABLE public.brand_proposals 
RENAME COLUMN influencer_id TO creator_id;

ALTER TABLE public.brand_proposals 
RENAME COLUMN influencer_signature TO creator_signature;

ALTER TABLE public.brand_proposals 
RENAME COLUMN influencer_signed_at TO creator_signed_at;

ALTER TABLE public.brand_proposals 
RENAME COLUMN influencer_condition_confirmed TO creator_condition_confirmed;

ALTER TABLE public.brand_proposals 
RENAME COLUMN influencer_team_id TO creator_team_id;


-- PHASE 5: Rename Columns in brand_campaign_contracts
-- ==========================================

ALTER TABLE public.brand_campaign_contracts 
RENAME COLUMN influencer_id TO creator_id;

ALTER TABLE public.brand_campaign_contracts 
RENAME COLUMN influencer_signature TO creator_signature;

ALTER TABLE public.brand_campaign_contracts 
RENAME COLUMN influencer_signed_at TO creator_signed_at;

ALTER TABLE public.brand_campaign_contracts 
RENAME COLUMN influencer_condition_confirmed TO creator_condition_confirmed;


-- PHASE 6: Rename Columns in campaign_proposals
-- ==========================================

ALTER TABLE public.campaign_proposals 
RENAME COLUMN influencer_id TO creator_id;

ALTER TABLE public.campaign_proposals 
RENAME COLUMN influencer_signature TO creator_signature;

ALTER TABLE public.campaign_proposals 
RENAME COLUMN influencer_signed_at TO creator_signed_at;

ALTER TABLE public.campaign_proposals 
RENAME COLUMN influencer_condition_confirmed TO creator_condition_confirmed;

ALTER TABLE public.campaign_proposals 
RENAME COLUMN influencer_team_id TO creator_team_id;


-- PHASE 7: Rename Columns in moment_proposals
-- ==========================================

ALTER TABLE public.moment_proposals 
RENAME COLUMN influencer_id TO creator_id;

ALTER TABLE public.moment_proposals 
RENAME COLUMN influencer_condition_confirmed TO creator_condition_confirmed;

ALTER TABLE public.moment_proposals 
RENAME COLUMN influencer_signature TO creator_signature;

ALTER TABLE public.moment_proposals 
RENAME COLUMN influencer_signed_at TO creator_signed_at;

ALTER TABLE public.moment_proposals 
RENAME COLUMN influencer_team_id TO creator_team_id;


-- PHASE 8: Rename Columns in campaign_applications
-- ==========================================

-- Note: campaign_applications uses 'applicant_id' which is correct


-- PHASE 9: Update Function Names and Content
-- ==========================================

-- Rename notification function
DROP FUNCTION IF EXISTS notify_influencer_on_moment_proposal();
CREATE OR REPLACE FUNCTION notify_creator_on_moment_proposal()
RETURNS TRIGGER AS $$
DECLARE
    brand_name TEXT;
BEGIN
    SELECT display_name INTO brand_name
    FROM profiles WHERE id = NEW.brand_id;
    
    INSERT INTO notifications (
        user_id,
        type,
        content,
        reference_id
    ) VALUES (
        NEW.creator_id,
        'proposal_received',
        COALESCE(brand_name, '브랜드') || '님이 모먼트 제안을 보냈습니다.',
        NEW.id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_moment_proposal ON moment_proposals;
CREATE TRIGGER on_moment_proposal
AFTER INSERT ON moment_proposals
FOR EACH ROW EXECUTE PROCEDURE notify_creator_on_moment_proposal();


-- Rename campaign application notification function
DROP FUNCTION IF EXISTS notify_brand_on_campaign_application();
CREATE OR REPLACE FUNCTION notify_brand_on_campaign_application()
RETURNS TRIGGER AS $$
DECLARE
    campaign_name TEXT;
    brand_user_id UUID;
    creator_name TEXT;
BEGIN
    SELECT c.title, c.brand_id INTO campaign_name, brand_user_id
    FROM campaigns c WHERE c.id = NEW.campaign_id;
    
    SELECT display_name INTO creator_name
    FROM profiles WHERE id = NEW.creator_id;
    
    INSERT INTO notifications (
        user_id,
        type,
        content,
        reference_id
    ) VALUES (
        brand_user_id,
        'application_received',
        COALESCE(creator_name, '크리에이터') || '님이 "' || COALESCE(campaign_name, '캠페인') || '" 캠페인에 지원했습니다.',
        NEW.id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_campaign_application ON campaign_proposals;
CREATE TRIGGER on_campaign_application
AFTER INSERT ON campaign_proposals
FOR EACH ROW EXECUTE PROCEDURE notify_brand_on_campaign_application();


-- PHASE 10: Update RLS Policy Names (for clarity)
-- ==========================================

-- creator_details (formerly influencer_details)
DROP POLICY IF EXISTS "Public influencer_details" ON public.creator_details;
CREATE POLICY "Public creator_details" ON public.creator_details FOR SELECT USING (true);

DROP POLICY IF EXISTS "Self insert details" ON public.creator_details;
CREATE POLICY "Self insert details" ON public.creator_details FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Self update details" ON public.creator_details;
CREATE POLICY "Self update details" ON public.creator_details FOR UPDATE USING (auth.uid() = id);


-- life_moments
DROP POLICY IF EXISTS "Public life_moments" ON public.life_moments;
DROP POLICY IF EXISTS "Public view moments" ON public.life_moments;
CREATE POLICY "Public view moments" ON public.life_moments FOR SELECT USING (
    is_private = false OR 
    auth.uid() = creator_id OR
    team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()) OR 
    EXISTS (SELECT 1 FROM public.team_members WHERE user_id = creator_id AND team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()))
);

DROP POLICY IF EXISTS "Influencer manage moments" ON public.life_moments;
DROP POLICY IF EXISTS "Team manage moments" ON public.life_moments;
CREATE POLICY "Team manage moments" ON public.life_moments FOR ALL USING (
    auth.uid() = creator_id OR
    team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);


-- brand_proposals
DROP POLICY IF EXISTS "Brand proposals view" ON public.brand_proposals;
CREATE POLICY "Brand proposals view" ON public.brand_proposals FOR SELECT USING (
    auth.uid() = brand_id OR 
    auth.uid() = creator_id
);

DROP POLICY IF EXISTS "Team proposals insert" ON public.brand_proposals;
CREATE POLICY "Team proposals insert" ON public.brand_proposals FOR INSERT WITH CHECK (
    brand_team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()) OR
    creator_team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Team proposals update" ON public.brand_proposals;
CREATE POLICY "Team proposals update" ON public.brand_proposals FOR UPDATE USING (
    brand_team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()) OR
    creator_team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);


-- campaign_proposals
DROP POLICY IF EXISTS "Campaign proposals view" ON public.campaign_proposals;
CREATE POLICY "Campaign proposals view" ON public.campaign_proposals FOR SELECT USING (
    auth.uid() = creator_id OR 
    EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_proposals.campaign_id AND c.brand_id = auth.uid())
);

DROP POLICY IF EXISTS "Team campaign proposals insert" ON public.campaign_proposals;
CREATE POLICY "Team campaign proposals insert" ON public.campaign_proposals FOR INSERT WITH CHECK (
    creator_team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Team campaign proposals update" ON public.campaign_proposals;
CREATE POLICY "Team campaign proposals update" ON public.campaign_proposals FOR UPDATE USING (
    creator_team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_proposals.campaign_id AND c.team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()))
);


-- moment_proposals
DROP POLICY IF EXISTS "Moment proposals view" ON public.moment_proposals;
CREATE POLICY "Moment proposals view" ON public.moment_proposals FOR SELECT USING (
    auth.uid() = brand_id OR 
    auth.uid() = creator_id
);

DROP POLICY IF EXISTS "Team moment proposals insert" ON public.moment_proposals;
CREATE POLICY "Team moment proposals insert" ON public.moment_proposals FOR INSERT WITH CHECK (
    brand_team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Team moment proposals update" ON public.moment_proposals;
CREATE POLICY "Team moment proposals update" ON public.moment_proposals FOR UPDATE USING (
    brand_team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()) OR
    creator_team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Team moment proposals delete" ON public.moment_proposals;
CREATE POLICY "Team moment proposals delete" ON public.moment_proposals FOR DELETE USING (
    brand_team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()) OR
    creator_team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);


-- messages  
DROP POLICY IF EXISTS "Messages view" ON public.messages;
CREATE POLICY "Messages view" ON public.messages FOR SELECT USING (
    auth.uid() = sender_id OR 
    auth.uid() = receiver_id OR
    EXISTS (SELECT 1 FROM public.campaign_proposals p WHERE p.id = proposal_id AND (p.creator_id = auth.uid() OR EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = p.campaign_id AND c.brand_id = auth.uid()))) OR
    EXISTS (SELECT 1 FROM public.brand_proposals bp WHERE bp.id = brand_proposal_id AND (bp.creator_id = auth.uid() OR bp.brand_id = auth.uid()))
);


-- submission_feedback
DROP POLICY IF EXISTS "Submission feedback view" ON public.submission_feedback;
CREATE POLICY "Submission feedback view" ON public.submission_feedback FOR SELECT USING (
    auth.uid() = submitted_by OR 
    auth.uid() = reviewed_by OR
    EXISTS (SELECT 1 FROM public.campaign_proposals p WHERE p.id = proposal_id AND p.creator_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.brand_proposals bp WHERE bp.id = brand_proposal_id AND bp.creator_id = auth.uid())
);


-- campaign_applications
DROP POLICY IF EXISTS "Team manage applications" ON public.campaign_applications;
CREATE POLICY "Team manage applications" ON public.campaign_applications FOR ALL USING (
    auth.uid() = applicant_id OR
    EXISTS (SELECT 1 FROM public.team_members WHERE user_id = applicant_id AND team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()))
);


NOTIFY pgrst, 'reload schema';

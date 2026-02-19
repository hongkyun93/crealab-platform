-- Allow Brand to view applications to their own campaigns
DROP POLICY IF EXISTS "Team manage applications" ON public.campaign_applications;
CREATE POLICY "Team manage applications" ON public.campaign_applications FOR ALL USING (
    auth.uid() = influencer_id OR
    -- Brand access: Check if the campaign belongs to the brand
    EXISTS (
        SELECT 1 FROM public.campaigns c
        WHERE c.id = campaign_applications.campaign_id
        AND c.brand_id = auth.uid()
    ) OR
    -- Team access (MCN support)
    EXISTS (
        SELECT 1 FROM public.team_members tm_target
        JOIN public.team_members tm_auth ON tm_target.team_id = tm_auth.team_id
        WHERE tm_target.user_id = campaign_applications.influencer_id
        AND tm_auth.user_id = auth.uid()
    )
);

-- Fix feedback policy to reference campaign_applications instead of deleted campaign_proposals
DROP POLICY IF EXISTS "Feedback view" ON public.submission_feedback;
CREATE POLICY "Feedback view" ON public.submission_feedback FOR SELECT USING (
    sender_id = auth.uid() OR
    -- References campaign_applications instead of campaign_proposals
    EXISTS (
        SELECT 1 FROM public.campaign_applications p 
        WHERE p.id = proposal_id 
        AND (
            p.influencer_id = auth.uid() OR 
            EXISTS (
                SELECT 1 FROM public.campaigns c 
                WHERE c.id = p.campaign_id AND c.brand_id = auth.uid()
            )
        )
    ) OR
    EXISTS (SELECT 1 FROM public.brand_proposals bp WHERE bp.id = brand_proposal_id AND (bp.influencer_id = auth.uid() OR bp.brand_id = auth.uid()))
);

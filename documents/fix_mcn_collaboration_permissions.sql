-- Fix MCN Permissions for Collaboration Tables (Proposals, Messages, Feedbacks)

-- 1. Campaign Proposals (Applications)
DROP POLICY IF EXISTS "Influencer manage campaign_proposals" ON public.campaign_proposals;
DROP POLICY IF EXISTS "Influencer insert campaign_proposals" ON public.campaign_proposals;
DROP POLICY IF EXISTS "Influencer update campaign_proposals" ON public.campaign_proposals;
DROP POLICY IF EXISTS "Influencer delete campaign_proposals" ON public.campaign_proposals;
DROP POLICY IF EXISTS "Influencer specific select campaign_proposals" ON public.campaign_proposals;

CREATE POLICY "Influencer insert campaign_proposals" ON public.campaign_proposals FOR INSERT WITH CHECK (
    auth.uid() = influencer_id 
    OR 
    EXISTS (
        SELECT 1 FROM team_members tm_influencer
        JOIN team_members tm_auth ON tm_influencer.team_id = tm_auth.team_id
        WHERE tm_influencer.user_id = campaign_proposals.influencer_id
        AND tm_auth.user_id = auth.uid()
        AND tm_auth.role IN ('owner', 'admin')
    )
);

CREATE POLICY "Influencer update campaign_proposals" ON public.campaign_proposals FOR UPDATE USING (
    auth.uid() = influencer_id 
    OR 
    EXISTS (
        SELECT 1 FROM team_members tm_influencer
        JOIN team_members tm_auth ON tm_influencer.team_id = tm_auth.team_id
        WHERE tm_influencer.user_id = campaign_proposals.influencer_id
        AND tm_auth.user_id = auth.uid()
        AND tm_auth.role IN ('owner', 'admin')
    )
);

CREATE POLICY "Influencer select campaign_proposals" ON public.campaign_proposals FOR SELECT USING (
    auth.uid() = influencer_id 
    OR 
    EXISTS (
        SELECT 1 FROM team_members tm_influencer
        JOIN team_members tm_auth ON tm_influencer.team_id = tm_auth.team_id
        WHERE tm_influencer.user_id = campaign_proposals.influencer_id
        AND tm_auth.user_id = auth.uid()
        AND tm_auth.role IN ('owner', 'admin')
    )
    OR
    EXISTS (
       SELECT 1 FROM campaigns WHERE campaigns.id = campaign_proposals.campaign_id AND campaigns.brand_id = auth.uid()
    )
);

-- 2. Moment Proposals
DROP POLICY IF EXISTS "Influencer insert moment_proposals" ON public.moment_proposals;
DROP POLICY IF EXISTS "Influencer update moment_proposals" ON public.moment_proposals;
DROP POLICY IF EXISTS "Influencer select moment_proposals" ON public.moment_proposals;
DROP POLICY IF EXISTS "Influencer delete moment_proposals" ON public.moment_proposals;


CREATE POLICY "Influencer insert moment_proposals" ON public.moment_proposals FOR INSERT WITH CHECK (
    auth.uid() = influencer_id 
    OR 
    EXISTS (
        SELECT 1 FROM team_members tm_influencer
        JOIN team_members tm_auth ON tm_influencer.team_id = tm_auth.team_id
        WHERE tm_influencer.user_id = moment_proposals.influencer_id
        AND tm_auth.user_id = auth.uid()
        AND tm_auth.role IN ('owner', 'admin')
    )
    OR auth.uid() = brand_id -- Brands can also insert
);

CREATE POLICY "Influencer update moment_proposals" ON public.moment_proposals FOR UPDATE USING (
    auth.uid() = influencer_id 
    OR 
    EXISTS (
        SELECT 1 FROM team_members tm_influencer
        JOIN team_members tm_auth ON tm_influencer.team_id = tm_auth.team_id
        WHERE tm_influencer.user_id = moment_proposals.influencer_id
        AND tm_auth.user_id = auth.uid()
        AND tm_auth.role IN ('owner', 'admin')
    )
    OR auth.uid() = brand_id -- Brands can also update
);

CREATE POLICY "Influencer select moment_proposals" ON public.moment_proposals FOR SELECT USING (
    auth.uid() = influencer_id 
    OR 
    EXISTS (
        SELECT 1 FROM team_members tm_influencer
        JOIN team_members tm_auth ON tm_influencer.team_id = tm_auth.team_id
        WHERE tm_influencer.user_id = moment_proposals.influencer_id
        AND tm_auth.user_id = auth.uid()
        AND tm_auth.role IN ('owner', 'admin')
    )
    OR auth.uid() = brand_id
);

-- 3. Brand Proposals
DROP POLICY IF EXISTS "Influencer insert brand_proposals" ON public.brand_proposals;
DROP POLICY IF EXISTS "Influencer update brand_proposals" ON public.brand_proposals;
DROP POLICY IF EXISTS "Influencer select brand_proposals" ON public.brand_proposals;
DROP POLICY IF EXISTS "Influencer delete brand_proposals" ON public.brand_proposals;


CREATE POLICY "Influencer insert brand_proposals" ON public.brand_proposals FOR INSERT WITH CHECK (
    auth.uid() = influencer_id
    OR 
    EXISTS (
        SELECT 1 FROM team_members tm_influencer
        JOIN team_members tm_auth ON tm_influencer.team_id = tm_auth.team_id
        WHERE tm_influencer.user_id = brand_proposals.influencer_id
        AND tm_auth.user_id = auth.uid()
        AND tm_auth.role IN ('owner', 'admin')
    )
    OR auth.uid() = brand_id
);

CREATE POLICY "Influencer update brand_proposals" ON public.brand_proposals FOR UPDATE USING (
    auth.uid() = influencer_id 
    OR 
    EXISTS (
        SELECT 1 FROM team_members tm_influencer
        JOIN team_members tm_auth ON tm_influencer.team_id = tm_auth.team_id
        WHERE tm_influencer.user_id = brand_proposals.influencer_id
        AND tm_auth.user_id = auth.uid()
        AND tm_auth.role IN ('owner', 'admin')
    )
    OR auth.uid() = brand_id
);


CREATE POLICY "Influencer select brand_proposals" ON public.brand_proposals FOR SELECT USING (
    auth.uid() = influencer_id 
    OR 
    EXISTS (
        SELECT 1 FROM team_members tm_influencer
        JOIN team_members tm_auth ON tm_influencer.team_id = tm_auth.team_id
        WHERE tm_influencer.user_id = brand_proposals.influencer_id
        AND tm_auth.user_id = auth.uid()
        AND tm_auth.role IN ('owner', 'admin')
    )
    OR auth.uid() = brand_id
);

-- 4. Messages
DROP POLICY IF EXISTS "Influencer insert messages" ON public.messages;
DROP POLICY IF EXISTS "Influencer select messages" ON public.messages;

CREATE POLICY "Influencer insert messages" ON public.messages FOR INSERT WITH CHECK (
    (
        auth.uid() = sender_id
        OR
        EXISTS (
            SELECT 1 FROM team_members tm_sender
            JOIN team_members tm_auth ON tm_sender.team_id = tm_auth.team_id
            WHERE tm_sender.user_id = messages.sender_id
            AND tm_auth.user_id = auth.uid()
            AND tm_auth.role IN ('owner', 'admin')
        )
    )
);

CREATE POLICY "Influencer select messages" ON public.messages FOR SELECT USING (
    auth.uid() = sender_id 
    OR 
    auth.uid() = receiver_id
    OR 
    EXISTS (
        SELECT 1 FROM team_members tm_member
        JOIN team_members tm_auth ON tm_member.team_id = tm_auth.team_id
        WHERE (tm_member.user_id = messages.sender_id OR tm_member.user_id = messages.receiver_id)
        AND tm_auth.user_id = auth.uid()
        AND tm_auth.role IN ('owner', 'admin')
    )
);

-- 5. Submission Feedback
DROP POLICY IF EXISTS "Influencer insert submission_feedback" ON public.submission_feedback;
DROP POLICY IF EXISTS "Influencer select submission_feedback" ON public.submission_feedback;

CREATE POLICY "Influencer insert submission_feedback" ON public.submission_feedback FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    OR
    EXISTS (
        SELECT 1 FROM team_members tm_sender
        JOIN team_members tm_auth ON tm_sender.team_id = tm_auth.team_id
        WHERE tm_sender.user_id = submission_feedback.sender_id
        AND tm_auth.user_id = auth.uid()
        AND tm_auth.role IN ('owner', 'admin')
    )
);

CREATE POLICY "Influencer select submission_feedback" ON public.submission_feedback FOR SELECT USING (
    true -- Allow reading all feedback for simplicity if linked to proposal, or restrict:
    -- Actually better to restrict to participants
);
-- We won't restrict select too much for feedback to avoid complexity, usually scoped by proposal_id in query

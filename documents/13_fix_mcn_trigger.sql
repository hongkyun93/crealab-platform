
-- Force refresh of the trigger function to ensure Proxy Logic is active and safe

CREATE OR REPLACE FUNCTION public.set_proposal_team_ids()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. Campaign Proposals (Target: influencer_team_id)
    IF TG_TABLE_NAME = 'campaign_proposals' THEN
        IF NEW.influencer_id IS NOT NULL AND NEW.influencer_team_id IS NULL THEN
            -- A. Common Team (Agency Mode)
            NEW.influencer_team_id := (
                SELECT tm.team_id
                FROM public.team_members tm
                JOIN public.team_members agent_tm ON tm.team_id = agent_tm.team_id
                WHERE tm.user_id = NEW.influencer_id
                AND agent_tm.user_id = auth.uid()
                LIMIT 1
            );

            -- B. Fallback: any team of influencer
            IF NEW.influencer_team_id IS NULL THEN
                NEW.influencer_team_id := (
                    SELECT team_id FROM public.team_members
                    WHERE user_id = NEW.influencer_id
                    LIMIT 1
                );
            END IF;
        END IF;
    END IF;

    -- 2. Life Moments (Target: team_id)
    IF TG_TABLE_NAME = 'life_moments' THEN
        IF NEW.team_id IS NULL THEN
            -- A. Common Team (Agency Mode)
            NEW.team_id := (
                SELECT tm.team_id
                FROM public.team_members tm
                JOIN public.team_members agent_tm ON tm.team_id = agent_tm.team_id
                WHERE tm.user_id = NEW.influencer_id
                AND agent_tm.user_id = auth.uid()
                LIMIT 1
            );
            
            -- B. Owner Team (Self Mode)
            IF NEW.team_id IS NULL THEN
                NEW.team_id := (
                    SELECT team_id FROM public.team_members
                    WHERE user_id = NEW.influencer_id
                    AND role = 'owner'
                    LIMIT 1
                );
            END IF;
            
            -- C. Any Team (Fallback)
            IF NEW.team_id IS NULL THEN
                NEW.team_id := (
                    SELECT team_id FROM public.team_members
                    WHERE user_id = NEW.influencer_id
                    LIMIT 1
                );
            END IF;
        END IF;
    END IF;

    -- 3. Brand Proposals (Target: brand_team_id)
    IF TG_TABLE_NAME = 'brand_proposals' THEN
        IF NEW.brand_id IS NOT NULL AND NEW.brand_team_id IS NULL THEN
             NEW.brand_team_id := (
                SELECT team_id FROM public.team_members
                WHERE user_id = NEW.brand_id
                LIMIT 1
            );
        END IF;
    END IF;

    -- 4. Moment Proposals (Target: brand_team_id)
    IF TG_TABLE_NAME = 'moment_proposals' THEN
        IF NEW.brand_id IS NOT NULL AND NEW.brand_team_id IS NULL THEN
             NEW.brand_team_id := (
                SELECT team_id FROM public.team_members
                WHERE user_id = NEW.brand_id
                LIMIT 1
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-apply Triggers
DROP TRIGGER IF EXISTS trigger_set_life_moments_team_id ON public.life_moments;
CREATE TRIGGER trigger_set_life_moments_team_id
BEFORE INSERT ON public.life_moments
FOR EACH ROW EXECUTE FUNCTION public.set_proposal_team_ids();

DROP TRIGGER IF EXISTS trigger_set_proposal_team_ids ON public.campaign_proposals;
CREATE TRIGGER trigger_set_proposal_team_ids
BEFORE INSERT ON public.campaign_proposals
FOR EACH ROW EXECUTE FUNCTION public.set_proposal_team_ids();

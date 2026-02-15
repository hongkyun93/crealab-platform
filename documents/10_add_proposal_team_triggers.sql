-- Function to set team IDs on proposals before insert
CREATE OR REPLACE FUNCTION public.set_proposal_team_ids()
RETURNS TRIGGER AS $$
BEGIN
    -- Set influencer_team_id
    -- Logic: Try to find a team common to both influencer and current user (agent)
    -- This handles the case where an Agency User is inserting for a Creator they manage.
    IF NEW.influencer_id IS NOT NULL THEN
        NEW.influencer_team_id := (
            SELECT tm.team_id
            FROM public.team_members tm
            JOIN public.team_members agent_tm ON tm.team_id = agent_tm.team_id
            WHERE tm.user_id = NEW.influencer_id
            AND agent_tm.user_id = auth.uid()
            LIMIT 1
        );

        -- Fallback: If no common team (e.g. self-insert or system insert), pick any team of influencer
        IF NEW.influencer_team_id IS NULL THEN
            NEW.influencer_team_id := (
                SELECT team_id FROM public.team_members
                WHERE user_id = NEW.influencer_id
                LIMIT 1
            );
        END IF;
    END IF;

    -- For Brand Proposals
    IF TG_TABLE_NAME = 'brand_proposals' THEN
        -- Set brand_team_id from Brand User
        IF NEW.brand_id IS NOT NULL AND NEW.brand_team_id IS NULL THEN
             NEW.brand_team_id := (
                SELECT team_id FROM public.team_members
                WHERE user_id = NEW.brand_id
                LIMIT 1
            );
        END IF;
    END IF;

    END IF;

    -- For Moment Proposals
    IF TG_TABLE_NAME = 'moment_proposals' THEN
        -- Set brand_team_id from Brand User
        IF NEW.brand_id IS NOT NULL AND NEW.brand_team_id IS NULL THEN
             NEW.brand_team_id := (
                SELECT team_id FROM public.team_members
                WHERE user_id = NEW.brand_id
                LIMIT 1
            );
        END IF;
    END IF;

    -- For Life Moments (Proxy Creation Support)
    IF TG_TABLE_NAME = 'life_moments' THEN
        -- Set team_id
        -- Logic: If auth.uid() is the influencer, use their owner team.
        -- If auth.uid() is an agent (proxy), use the common team.
        IF NEW.team_id IS NULL THEN
            NEW.team_id := (
                SELECT tm.team_id
                FROM public.team_members tm
                JOIN public.team_members agent_tm ON tm.team_id = agent_tm.team_id
                WHERE tm.user_id = NEW.influencer_id
                AND agent_tm.user_id = auth.uid()
                LIMIT 1
            );
            
            -- Fallback: If no common team found (e.g. system insert), use influencer's owner team
            IF NEW.team_id IS NULL THEN
                NEW.team_id := (
                    SELECT team_id FROM public.team_members
                    WHERE user_id = NEW.influencer_id
                    AND role = 'owner'
                    LIMIT 1
                );
            END IF;
            
             -- Ultimate Fallback: Any team
            IF NEW.team_id IS NULL THEN
                NEW.team_id := (
                    SELECT team_id FROM public.team_members
                    WHERE user_id = NEW.influencer_id
                    LIMIT 1
                );
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Triggers
DROP TRIGGER IF EXISTS trigger_set_proposal_team_ids ON public.campaign_proposals;
CREATE TRIGGER trigger_set_proposal_team_ids
BEFORE INSERT ON public.campaign_proposals
FOR EACH ROW EXECUTE FUNCTION public.set_proposal_team_ids();

DROP TRIGGER IF EXISTS trigger_set_proposal_team_ids ON public.brand_proposals;
CREATE TRIGGER trigger_set_proposal_team_ids
BEFORE INSERT ON public.brand_proposals
FOR EACH ROW EXECUTE FUNCTION public.set_proposal_team_ids();

DROP TRIGGER IF EXISTS trigger_set_proposal_team_ids ON public.moment_proposals;
CREATE TRIGGER trigger_set_proposal_team_ids
BEFORE INSERT ON public.moment_proposals
FOR EACH ROW EXECUTE FUNCTION public.set_proposal_team_ids();

DROP TRIGGER IF EXISTS trigger_set_life_moments_team_id ON public.life_moments;
CREATE TRIGGER trigger_set_life_moments_team_id
BEFORE INSERT ON public.life_moments
FOR EACH ROW EXECUTE FUNCTION public.set_proposal_team_ids();

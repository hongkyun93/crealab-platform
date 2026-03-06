-- Migration 45: Add MCN Portfolio Links Table

CREATE TABLE IF NOT EXISTS public.mcn_portfolio_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    brand_name TEXT NOT NULL,
    message TEXT,
    creator_ids UUID[] NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ
);

-- RLS Setup
ALTER TABLE public.mcn_portfolio_links ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can view portfolio links (needed for the public landing page)
CREATE POLICY "Public can view portfolio links"
    ON public.mcn_portfolio_links 
    FOR SELECT
    USING (true);

-- Policy 2: Team members can insert portfolio links for their teams
CREATE POLICY "Team members can insert portfolio links"
    ON public.mcn_portfolio_links 
    FOR INSERT
    WITH CHECK (auth.uid() IN (SELECT user_id FROM public.team_members WHERE team_id = mcn_portfolio_links.team_id));

-- Policy 3: Team members can update portfolio links
CREATE POLICY "Team members can update portfolio links"
    ON public.mcn_portfolio_links 
    FOR UPDATE
    USING (auth.uid() IN (SELECT user_id FROM public.team_members WHERE team_id = mcn_portfolio_links.team_id));

-- Policy 4: Team members can delete portfolio links
CREATE POLICY "Team members can delete portfolio links"
    ON public.mcn_portfolio_links 
    FOR DELETE
    USING (auth.uid() IN (SELECT user_id FROM public.team_members WHERE team_id = mcn_portfolio_links.team_id));

-- Grant permissions for authenticated and anon users
GRANT SELECT ON public.mcn_portfolio_links TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mcn_portfolio_links TO authenticated;
GRANT ALL ON public.mcn_portfolio_links TO service_role;

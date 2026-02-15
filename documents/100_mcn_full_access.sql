-- Migration: MCN Full Access (RLS)
-- Purpose: Allow team members (Manager/Owner/Admin) to access and manage data of other team members (Creators).

-- 1. Helper Function: Check if auth user has access to target user's data via Team
CREATE OR REPLACE FUNCTION public.has_team_access(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.team_members tm_auth
    JOIN public.team_members tm_target ON tm_auth.team_id = tm_target.team_id
    WHERE tm_auth.user_id = auth.uid()
    AND tm_target.user_id = target_user_id
    -- Restrict to privileged roles in the team
    AND tm_auth.role IN ('owner', 'admin', 'manager')
  );
$$;

-- 2. Update Policies

-- 2.1 LIFE MOMENTS
DROP POLICY IF EXISTS "Public life_moments" ON public.life_moments;
CREATE POLICY "Public life_moments" ON public.life_moments 
FOR SELECT USING (
  is_private = false 
  OR auth.uid() = influencer_id 
  OR public.has_team_access(influencer_id)
);

DROP POLICY IF EXISTS "Influencer manage moments" ON public.life_moments;
CREATE POLICY "Influencer manage moments" ON public.life_moments 
FOR ALL USING (
  auth.uid() = influencer_id 
  OR public.has_team_access(influencer_id)
);

-- 2.2 MOMENT PROPOSALS
DROP POLICY IF EXISTS "Influencer manage proposals" ON public.moment_proposals;
-- (Assuming existing policies might need adjustment, let's just create a comprehensive one)
-- Check existing policies first? No, let's use IF EXISTS to be safe and define a strong policy.

-- For Moment Proposals, we need broader access for Brands too.
-- Let's redefine ALL access for Moment Proposals to be safe.
-- Access: Brand (Owner), Influencer (Receiver), or Team Member of Influencer.

DROP POLICY IF EXISTS "Unified moment_proposals access" ON public.moment_proposals;
CREATE POLICY "Unified moment_proposals access" ON public.moment_proposals
FOR ALL USING (
    auth.uid() = brand_id 
    OR auth.uid() = influencer_id
    OR public.has_team_access(influencer_id)
    -- OR public.has_team_access(brand_id) -- If we want Agency support later
);


-- 2.3 BRAND PRODUCTS (Optional, but good for completeness if Agencies use this)
DROP POLICY IF EXISTS "Brand manage products" ON public.brand_products;
CREATE POLICY "Brand manage products" ON public.brand_products 
FOR ALL USING (
  auth.uid() = brand_id 
  OR public.has_team_access(brand_id)
);

-- 2.4 CAMPAIGNS
DROP POLICY IF EXISTS "Brand manage campaigns" ON public.campaigns;
CREATE POLICY "Brand manage campaigns" ON public.campaigns 
FOR ALL USING (
  auth.uid() = brand_id 
  OR public.has_team_access(brand_id)
);

-- 2.5 INSTAGRAM ACCOUNTS (To view stats)
DROP POLICY IF EXISTS "Self view instagram" ON public.instagram_accounts;
CREATE POLICY "Self view instagram" ON public.instagram_accounts 
FOR SELECT USING (
  auth.uid() = user_id 
  OR public.has_team_access(user_id)
);

DROP POLICY IF EXISTS "Self manage instagram" ON public.instagram_accounts;
CREATE POLICY "Self manage instagram" ON public.instagram_accounts 
FOR ALL USING (
  auth.uid() = user_id 
  OR public.has_team_access(user_id)
);

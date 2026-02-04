-- ==========================================
-- ADMIN PERMISSIONS SETUP
-- ==========================================

-- 1. Helper to check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update RLS Policies for Admin Deletion

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE USING (public.is_admin());
CREATE POLICY "Admins can see all profiles" ON public.profiles FOR SELECT USING (public.is_admin() OR true); -- true is already there but for clarity

-- Influencer Events
ALTER TABLE public.influencer_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can delete influencer events" ON public.influencer_events FOR DELETE USING (public.is_admin());
CREATE POLICY "Admins can update influencer events" ON public.influencer_events FOR UPDATE USING (public.is_admin());

-- Brand Products
ALTER TABLE public.brand_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can delete brand products" ON public.brand_products FOR DELETE USING (public.is_admin());
CREATE POLICY "Admins can update brand products" ON public.brand_products FOR UPDATE USING (public.is_admin());

-- Campaigns
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can delete campaigns" ON public.campaigns;
CREATE POLICY "Admins can delete campaigns" ON public.campaigns FOR DELETE USING (public.is_admin());
CREATE POLICY "Admins can update campaigns" ON public.campaigns FOR UPDATE USING (public.is_admin());
CREATE POLICY "Campaigns are viewable by everyone" ON public.campaigns FOR SELECT USING (true);
CREATE POLICY "Brands can insert own campaigns" ON public.campaigns FOR INSERT WITH CHECK (auth.uid() = brand_id);

-- Proposals
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can delete proposals" ON public.proposals FOR DELETE USING (public.is_admin());
CREATE POLICY "Admins can see all proposals" ON public.proposals FOR SELECT USING (public.is_admin() OR auth.uid() = influencer_id);

-- Brand Proposals
ALTER TABLE public.brand_proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can delete brand proposals" ON public.brand_proposals FOR DELETE USING (public.is_admin());
CREATE POLICY "Admins can update brand proposals" ON public.brand_proposals FOR UPDATE USING (public.is_admin());

-- Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can delete messages" ON public.messages FOR DELETE USING (public.is_admin());

-- ==========================================
-- HOW TO MAKE A USER AN ADMIN
-- ==========================================
-- Run this replacing 'USER_ID_HERE' with the actual user ID from auth.users or profiles.
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'USER_ID_HERE';

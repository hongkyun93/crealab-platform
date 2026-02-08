-- Fix RLS Policies for User Profiles & Details

-- 1. Profiles: Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Allow users to insert their own profile (e.g. on signup)
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow everyone to read profiles (needed for viewing creators/brands)
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);


-- 2. Influencer Details: Allow users to update their own details
CREATE POLICY "Users can update own details" 
ON public.influencer_details 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own details" 
ON public.influencer_details 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Public details are viewable by everyone" 
ON public.influencer_details 
FOR SELECT 
USING (true);

-- 3. Brand Products: Allow brands to manage their products
CREATE POLICY "Brands can manage own products" 
ON public.brand_products 
FOR ALL 
USING (auth.uid() = brand_id);

CREATE POLICY "Everyone can view products" 
ON public.brand_products 
FOR SELECT 
USING (true);

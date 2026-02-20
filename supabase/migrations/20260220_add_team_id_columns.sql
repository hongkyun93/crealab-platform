-- =====================================================
-- Add missing team_id columns to life_moments and brand_products
-- These columns are used by MCN team filtering in the code
-- but were missing from the live DB schema.
-- =====================================================

-- life_moments.team_id
ALTER TABLE public.life_moments
ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL;

-- brand_products.team_id
ALTER TABLE public.brand_products
ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL;

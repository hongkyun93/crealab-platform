-- Fix missing columns in settlements table
ALTER TABLE public.settlements ADD COLUMN IF NOT EXISTS proposal_type text;
ALTER TABLE public.settlements ADD COLUMN IF NOT EXISTS proposal_id text;

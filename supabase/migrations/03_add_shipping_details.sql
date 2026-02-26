-- Migration: Add shipping details to profiles
-- Description: Adds shipping_name and shipping_phone to profiles table for creator/brand shipping info

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS shipping_name text,
ADD COLUMN IF NOT EXISTS shipping_phone text;

COMMENT ON COLUMN public.profiles.shipping_name IS '수령인 이름 (제품 배송용)';
COMMENT ON COLUMN public.profiles.shipping_phone IS '수령인 연락처 (제품 배송용)';

-- Migration: Drop legacy instagram_accounts table
-- This table was created for an early Instagram OAuth flow
-- but has been superseded by the social_channels table.
-- No code references exist to instagram_accounts.

DROP TABLE IF EXISTS public.instagram_accounts;

-- Migration: Add action_url and metadata to notifications
-- Usage: Adds columns to support deep linking and 
--        tab categorization/debouncing for the new notification system.

ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS action_url text,
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.notifications.action_url IS 'Deep link URL to navigate to when the notification is clicked.';
COMMENT ON COLUMN public.notifications.metadata IS 'Additional metadata for filtering (e.g. { "target_tab": "contract" }) or debouncing logic.';

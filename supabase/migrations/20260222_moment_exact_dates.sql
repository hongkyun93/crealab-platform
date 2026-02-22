-- Migration: Add exact date fields to influencer_events
-- Date: 20260222
-- Purpose: Store precise event start/end dates and exact posting date
-- while keeping existing TEXT columns for backward-compatible brand display (year-month only)

ALTER TABLE influencer_events
  ADD COLUMN IF NOT EXISTS event_start_date DATE,
  ADD COLUMN IF NOT EXISTS event_end_date   DATE,
  ADD COLUMN IF NOT EXISTS posting_date_exact DATE;

-- Migrate existing TEXT data to new DATE columns
-- Only migrate rows where event_date matches ISO format "YYYY-MM-DD"
UPDATE influencer_events
SET event_start_date = event_date::DATE
WHERE event_date ~ '^\d{4}-\d{2}-\d{2}$'
  AND event_start_date IS NULL;

UPDATE influencer_events
SET posting_date_exact = posting_date::DATE
WHERE posting_date ~ '^\d{4}-\d{2}-\d{2}$'
  AND posting_date_exact IS NULL;

-- Add comments for clarity
COMMENT ON COLUMN influencer_events.event_start_date IS 'Exact event start date (private — shown only to creator + MCN). Brands see only event_date (year-month).';
COMMENT ON COLUMN influencer_events.event_end_date   IS 'Exact event end date for multi-day events (optional, NULL = single day). Private.';
COMMENT ON COLUMN influencer_events.posting_date_exact IS 'Exact planned upload date (private — shown only to creator + MCN). Brands see only posting_date (year-month).';

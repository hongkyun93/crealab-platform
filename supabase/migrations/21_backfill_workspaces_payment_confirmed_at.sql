-- Migration 21: Add payment_confirmed_at to product_applications + backfill workspaces
-- Fixes: (1) product_applications missing the column  (2) old payments didn't sync to workspaces

-- 1. product_applications에 payment_confirmed_at 컬럼 추가 (migration 20은 moment/campaign만 했음)
ALTER TABLE public.product_applications
    ADD COLUMN IF NOT EXISTS payment_confirmed_at timestamp with time zone;

-- 2. workspaces 백필 — moment_proposals에서
UPDATE workspaces w
SET payment_confirmed_at = mp.payment_confirmed_at
FROM moment_proposals mp
WHERE mp.workspace_id = w.id
  AND mp.payment_confirmed_at IS NOT NULL
  AND w.payment_confirmed_at IS NULL;

-- 3. workspaces 백필 — product_applications에서 (컬럼 방금 추가됐으므로 값은 null이지만 향후 대비)
-- (현재 데이터는 없으니 no-op)

-- 4. workspaces 백필 — campaign_applications에서
UPDATE workspaces w
SET payment_confirmed_at = ca.payment_confirmed_at
FROM campaign_applications ca
WHERE ca.workspace_id = w.id
  AND ca.payment_confirmed_at IS NOT NULL
  AND w.payment_confirmed_at IS NULL;

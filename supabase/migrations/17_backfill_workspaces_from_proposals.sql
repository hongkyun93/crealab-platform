-- ============================================================
-- 17_backfill_workspaces_from_proposals.sql
-- 기존 데이터를 moment_proposals.conditions + product_applications
-- → workspaces 로 일괄 복사
-- COALESCE를 사용해 workspaces에 이미 값이 있으면 덮어쓰지 않음
-- ============================================================

-- 1) moment_proposals.conditions → workspaces 복사
UPDATE public.workspaces w
SET
  price_offer                   = COALESCE((mp.conditions->>'price_offer')::bigint, w.price_offer),
  product_type                  = COALESCE(mp.conditions->>'product_type', w.product_type),
  video_guide                   = COALESCE(mp.conditions->>'video_guide', w.video_guide),
  secondary_usage_fee           = COALESCE((mp.conditions->>'secondary_usage_fee')::integer, w.secondary_usage_fee),

  -- 계약
  contract_status               = COALESCE(mp.conditions->>'contract_status', w.contract_status),
  contract_content              = COALESCE(mp.conditions->>'contract_content', w.contract_content),
  brand_signature               = COALESCE(mp.conditions->>'brand_signature', w.brand_signature),
  creator_signature             = COALESCE(mp.conditions->>'creator_signature', w.creator_signature),
  brand_signed_at               = COALESCE((mp.conditions->>'brand_signed_at')::timestamptz, w.brand_signed_at),
  creator_signed_at             = COALESCE((mp.conditions->>'creator_signed_at')::timestamptz, w.creator_signed_at),

  -- 조건 확인
  brand_condition_confirmed     = COALESCE((mp.conditions->>'brand_condition_confirmed')::boolean, w.brand_condition_confirmed),
  creator_condition_confirmed   = COALESCE((mp.conditions->>'creator_condition_confirmed')::boolean, w.creator_condition_confirmed),

  -- 일정 조건
  condition_draft_submission_date   = COALESCE(mp.conditions->>'condition_draft_submission_date', w.condition_draft_submission_date),
  condition_final_submission_date   = COALESCE(mp.conditions->>'condition_final_submission_date', w.condition_final_submission_date),
  condition_upload_date             = COALESCE(mp.conditions->>'condition_upload_date', w.condition_upload_date),
  condition_product_receipt_date    = COALESCE(mp.conditions->>'condition_product_receipt_date', w.condition_product_receipt_date),
  condition_secondary_usage_period  = COALESCE(mp.conditions->>'condition_secondary_usage_period', w.condition_secondary_usage_period),
  condition_maintenance_period      = COALESCE(mp.conditions->>'condition_maintenance_period', w.condition_maintenance_period),

  -- 배송
  shipping_phone                = COALESCE(mp.conditions->>'shipping_phone', w.shipping_phone),
  shipping_address              = COALESCE(mp.conditions->>'shipping_address', w.shipping_address),
  tracking_number               = COALESCE(mp.conditions->>'tracking_number', w.tracking_number),
  delivery_status               = COALESCE(mp.conditions->>'delivery_status', w.delivery_status),

  -- 콘텐츠 제출
  content_submission_status     = COALESCE(mp.conditions->>'content_submission_status', w.content_submission_status),
  content_submission_url        = COALESCE(mp.conditions->>'content_submission_url', w.content_submission_url),
  content_submission_file_url   = COALESCE(mp.conditions->>'content_submission_file_url', w.content_submission_file_url),
  content_submission_version    = COALESCE((mp.conditions->>'content_submission_version')::numeric, w.content_submission_version),
  content_submission_date       = COALESCE((mp.conditions->>'content_submission_date')::timestamptz, w.content_submission_date),
  content_final_url             = COALESCE(mp.conditions->>'content_final_url', w.content_final_url),
  content_clean_url             = COALESCE(mp.conditions->>'content_clean_url', w.content_clean_url),
  content_final_approved_at     = COALESCE((mp.conditions->>'content_final_approved_at')::timestamptz, w.content_final_approved_at),
  content_revision_requested_at = COALESCE((mp.conditions->>'content_revision_requested_at')::timestamptz, w.content_revision_requested_at),

  -- 정산
  payment_confirmed_at          = COALESCE((mp.conditions->>'payment_confirmed_at')::timestamptz, w.payment_confirmed_at)
FROM public.moment_proposals mp
WHERE mp.workspace_id = w.id
  AND mp.workspace_id IS NOT NULL
  AND mp.status IN ('accepted', 'signed', 'confirmed', 'settlement', 'final_complete', 'completed');

-- ============================================================
-- 2) product_applications 는 별도 컬럼이 없어 백필 불필요
-- (계약/배송/콘텐츠 데이터가 product_applications에는 없음)
-- moment_proposals.conditions → workspaces 복사(위 #1)만으로 충분
-- ============================================================


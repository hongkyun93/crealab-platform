-- =====================================================
-- CREALAB MASTER FIX SQL
-- 이 파일 하나만 Supabase Dashboard에서 실행하면 됩니다.
-- 멱등(idempotent): 여러 번 실행해도 안전합니다.
-- =====================================================


-- ═══════════════════════════════════════════════════
-- PART 1: brand_proposals → product_applications 테이블 rename
-- ═══════════════════════════════════════════════════

-- 1-1. 테이블 rename (이미 됐으면 건너뜀)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='brand_proposals') THEN
    ALTER TABLE public.brand_proposals RENAME TO product_applications;
  END IF;
END $$;

-- 1-2. messages.brand_proposal_id → product_application_id (이미 됐으면 건너뜀)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='messages' AND column_name='brand_proposal_id') THEN
    ALTER TABLE public.messages RENAME COLUMN brand_proposal_id TO product_application_id;
  END IF;
END $$;

-- 1-3. messages: product_applications/brand_proposals 참조하는 FK 전부 동적 제거
--       (messages_proposal_id_fkey, messages_brand_proposal_id_fkey 등 이름 무관)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.referential_constraints rc ON rc.constraint_name = tc.constraint_name
    JOIN information_schema.table_constraints tc2 ON tc2.constraint_name = rc.unique_constraint_name
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'messages'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND tc2.table_name IN ('product_applications', 'brand_proposals')
  LOOP
    EXECUTE 'ALTER TABLE public.messages DROP CONSTRAINT ' || quote_ident(r.constraint_name);
  END LOOP;
END $$;


-- 1-4. submission_feedback rename (이미 됐으면 건너뜀)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='submission_feedback' AND column_name='brand_proposal_id') THEN
    ALTER TABLE public.submission_feedback RENAME COLUMN brand_proposal_id TO product_application_id;
  END IF;
END $$;

-- 1-5. submission_feedback FK 제거
DO $$ DECLARE fk text;
BEGIN
  SELECT tc.constraint_name INTO fk
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu ON tc.constraint_name=kcu.constraint_name
  WHERE tc.table_schema='public' AND tc.table_name='submission_feedback'
    AND tc.constraint_type='FOREIGN KEY'
    AND kcu.column_name IN ('brand_proposal_id','product_application_id');
  IF fk IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.submission_feedback DROP CONSTRAINT ' || quote_ident(fk);
  END IF;
END $$;

-- 1-6. workspaces: 기존 데이터 UPDATE 먼저, 그 다음 CHECK 제약 교체
ALTER TABLE public.workspaces DROP CONSTRAINT IF EXISTS workspaces_proposal_type_check;

UPDATE public.workspaces SET proposal_type = 'product_application'
WHERE proposal_type = 'brand_proposal';

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema='public' AND table_name='workspaces' AND constraint_name='workspaces_proposal_type_check'
  ) THEN
    ALTER TABLE public.workspaces ADD CONSTRAINT workspaces_proposal_type_check
      CHECK (proposal_type IN ('product_application','moment_proposal','campaign_application'));
  END IF;
END $$;


-- ═══════════════════════════════════════════════════
-- PART 2: ADD COLUMN (멱등)
-- ═══════════════════════════════════════════════════

-- 2-1. product_applications 컬럼 추가 (없을 경우만)
ALTER TABLE public.product_applications ADD COLUMN IF NOT EXISTS channel_subtype TEXT;
ALTER TABLE public.product_applications ADD COLUMN IF NOT EXISTS receiver_name TEXT;
ALTER TABLE public.product_applications ADD COLUMN IF NOT EXISTS shipping_phone TEXT;
ALTER TABLE public.product_applications ADD COLUMN IF NOT EXISTS shipping_address TEXT;
ALTER TABLE public.product_applications ADD COLUMN IF NOT EXISTS content_final_url TEXT;
ALTER TABLE public.product_applications ADD COLUMN IF NOT EXISTS content_clean_url TEXT;
ALTER TABLE public.product_applications ADD COLUMN IF NOT EXISTS content_submission_file_url TEXT;
ALTER TABLE public.product_applications ADD COLUMN IF NOT EXISTS content_submission_version NUMERIC;
ALTER TABLE public.product_applications ADD COLUMN IF NOT EXISTS content_submission_date TIMESTAMPTZ;
ALTER TABLE public.product_applications ADD COLUMN IF NOT EXISTS secondary_usage_fee INTEGER DEFAULT 0;
ALTER TABLE public.product_applications ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMPTZ;
ALTER TABLE public.product_applications ADD COLUMN IF NOT EXISTS content_final_approved_at TIMESTAMPTZ;
ALTER TABLE public.product_applications ADD COLUMN IF NOT EXISTS content_revision_requested_at TIMESTAMPTZ;


-- ═══════════════════════════════════════════════════
-- PART 3: messages & submission_feedback RLS 완전 재정의
-- ═══════════════════════════════════════════════════

-- 3-1. messages 기존 정책 전부 동적 제거
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='messages'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.messages', r.policyname);
  END LOOP;
END $$;

-- 3-2. messages 새 정책 (컬럼명 참조 없는 단순 auth.uid())
CREATE POLICY "messages_select" ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "messages_insert" ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "messages_update" ON public.messages FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- 3-3. submission_feedback 기존 정책 전부 동적 제거
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='submission_feedback'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.submission_feedback', r.policyname);
  END LOOP;
END $$;

-- 3-4. submission_feedback 새 정책
CREATE POLICY "submission_feedback_select" ON public.submission_feedback FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "submission_feedback_insert" ON public.submission_feedback FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "submission_feedback_update" ON public.submission_feedback FOR UPDATE
  USING (auth.uid() = sender_id);


-- ═══════════════════════════════════════════════════
-- PART 4: Admin RLS Bypass
-- ═══════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

DROP POLICY IF EXISTS "admin_read_brand_proposals"      ON public.product_applications;
DROP POLICY IF EXISTS "admin_update_brand_proposals"    ON public.product_applications;
DROP POLICY IF EXISTS "admin_read_product_applications" ON public.product_applications;
DROP POLICY IF EXISTS "admin_update_product_applications" ON public.product_applications;
CREATE POLICY "admin_read_product_applications"   ON public.product_applications FOR SELECT USING (public.is_admin());
CREATE POLICY "admin_update_product_applications" ON public.product_applications FOR UPDATE USING (public.is_admin());


-- ═══════════════════════════════════════════════════
-- PART 5: Settlement 트리거 재정의
-- ═══════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.fn_auto_create_settlement()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_creator_id    uuid;
  v_brand_id      uuid;
  v_price_offer   integer;
  v_team_id       uuid;
  v_split_ratio   numeric(4,3);
  v_gross         integer;
  v_creator_amt   integer;
  v_mcn_amt       integer;
  v_withhold_rate numeric(5,4) := 0.033;
  v_withhold_amt  integer;
  v_net_amt       integer;
  v_prop_type     text;
  v_prop_id       text;
  v_month         text;
BEGIN
  IF NEW.status != 'completed' OR OLD.status = 'completed' THEN RETURN NEW; END IF;

  IF TG_TABLE_NAME = 'product_applications' THEN
    v_creator_id  := NEW.influencer_id;
    v_brand_id    := NEW.brand_id;
    v_price_offer := COALESCE(NEW.price_offer, 0);
    v_prop_type   := 'product_application';
    v_prop_id     := NEW.id::text;
  ELSIF TG_TABLE_NAME = 'moment_proposals' THEN
    v_creator_id  := NEW.influencer_id;
    v_brand_id    := NEW.brand_id;
    v_price_offer := COALESCE(NEW.price_offer, 0);
    v_prop_type   := 'moment_proposal';
    v_prop_id     := NEW.id::text;
  ELSIF TG_TABLE_NAME = 'campaign_applications' THEN
    v_creator_id  := NEW.influencer_id;
    v_price_offer := COALESCE(NEW.price_offer, 0);
    v_prop_type   := 'campaign_application';
    v_prop_id     := NEW.id::text;
    SELECT brand_id INTO v_brand_id FROM public.campaigns WHERE id = NEW.campaign_id;
  END IF;

  IF v_price_offer <= 0 THEN RETURN NEW; END IF;
  IF EXISTS (SELECT 1 FROM public.settlements WHERE proposal_type=v_prop_type AND proposal_id=v_prop_id) THEN RETURN NEW; END IF;

  SELECT tm.team_id INTO v_team_id
  FROM public.team_members tm
  JOIN public.team_members owner_tm ON owner_tm.team_id=tm.team_id AND owner_tm.role='owner'
  JOIN public.profiles owner_p ON owner_p.id=owner_tm.user_id AND owner_p.role='mcn'
  WHERE tm.user_id=v_creator_id AND tm.role != 'owner' LIMIT 1;

  IF v_team_id IS NULL THEN RETURN NEW; END IF;

  SELECT split_ratio INTO v_split_ratio FROM public.mcn_revenue_splits WHERE team_id=v_team_id AND creator_id=v_creator_id;
  IF v_split_ratio IS NULL THEN v_split_ratio := 0.700; END IF;

  v_gross        := v_price_offer;
  v_creator_amt  := ROUND(v_gross * v_split_ratio);
  v_mcn_amt      := v_gross - v_creator_amt;
  v_withhold_amt := ROUND(v_creator_amt * v_withhold_rate);
  v_net_amt      := v_creator_amt - v_withhold_amt;
  v_month        := TO_CHAR(NOW(), 'YYYY-MM');

  INSERT INTO public.settlements (
    team_id, creator_id, brand_id, proposal_type, proposal_id,
    gross_amount, split_ratio, creator_amount, mcn_amount,
    withholding_rate, withholding_amount, net_creator_amount, status, settlement_month
  ) VALUES (
    v_team_id, v_creator_id, v_brand_id, v_prop_type, v_prop_id,
    v_gross, v_split_ratio, v_creator_amt, v_mcn_amt,
    v_withhold_rate, v_withhold_amt, v_net_amt, 'pending', v_month
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_settlement_on_product_application_complete ON public.product_applications;
DROP TRIGGER IF EXISTS trg_settlement_on_brand_proposal_complete      ON public.product_applications;
CREATE TRIGGER trg_settlement_on_product_application_complete
  AFTER UPDATE OF status ON public.product_applications
  FOR EACH ROW EXECUTE FUNCTION public.fn_auto_create_settlement();

DROP TRIGGER IF EXISTS trg_settlement_on_moment_proposal_complete ON public.moment_proposals;
CREATE TRIGGER trg_settlement_on_moment_proposal_complete
  AFTER UPDATE OF status ON public.moment_proposals
  FOR EACH ROW EXECUTE FUNCTION public.fn_auto_create_settlement();

DROP TRIGGER IF EXISTS trg_settlement_on_campaign_app_complete ON public.campaign_applications;
CREATE TRIGGER trg_settlement_on_campaign_app_complete
  AFTER UPDATE OF status ON public.campaign_applications
  FOR EACH ROW EXECUTE FUNCTION public.fn_auto_create_settlement();


-- ═══════════════════════════════════════════════════
-- PART 6: MCN RPC 함수 재정의
-- ═══════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_team_dashboard_summary(target_team_id UUID)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public VOLATILE AS $$
DECLARE caller_id UUID; result json;
BEGIN
  caller_id := auth.uid();
  IF caller_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.team_members WHERE team_id=target_team_id AND user_id=caller_id)
  THEN RAISE EXCEPTION 'Not a member of this team'; END IF;

  SELECT json_agg(creator_summary) INTO result FROM (
    SELECT
      tm.user_id, p.display_name, p.avatar_url, p.instagram_handle,
      p.followers_count, p.tier, p.tags, p.price_video, p.price_feed,
      COALESCE(ms.total_moments, 0) AS total_moments,
      COALESCE(ms.active_moments, 0) AS active_moments,
      COALESCE(pa.total_proposals, 0) AS total_product_applications,
      COALESCE(pa.pending_proposals, 0) AS pending_product_applications,
      COALESCE(pa.active_proposals, 0) AS active_product_applications,
      COALESCE(pa.total_revenue, 0) AS product_revenue,
      COALESCE(mp.total_proposals, 0) AS total_moment_proposals,
      COALESCE(mp.pending_proposals, 0) AS pending_moment_proposals,
      COALESCE(mp.active_proposals, 0) AS active_moment_proposals,
      COALESCE(mp.total_revenue, 0) AS moment_revenue,
      COALESCE(ca.total_applications, 0) AS total_campaign_applications,
      COALESCE(ca.pending_applications, 0) AS pending_campaign_applications,
      COALESCE(ca.active_applications, 0) AS active_campaign_applications
    FROM public.team_members tm
    JOIN public.profiles p ON p.id = tm.user_id
    LEFT JOIN LATERAL (
      SELECT COUNT(*) total_moments, COUNT(*) FILTER (WHERE lm.status='recruiting') active_moments
      FROM public.life_moments lm WHERE lm.influencer_id=tm.user_id
    ) ms ON true
    LEFT JOIN LATERAL (
      SELECT COUNT(*) total_proposals,
        COUNT(*) FILTER (WHERE a.status='offered') pending_proposals,
        COUNT(*) FILTER (WHERE a.status IN ('accepted','active','in_progress')) active_proposals,
        COALESCE(SUM(a.price_offer) FILTER (WHERE a.status IN ('accepted','active','in_progress','completed')),0) total_revenue
      FROM public.product_applications a WHERE a.influencer_id=tm.user_id
    ) pa ON true
    LEFT JOIN LATERAL (
      SELECT COUNT(*) total_proposals,
        COUNT(*) FILTER (WHERE m.status='offered') pending_proposals,
        COUNT(*) FILTER (WHERE m.status IN ('accepted','active','in_progress')) active_proposals,
        COALESCE(SUM(m.price_offer) FILTER (WHERE m.status IN ('accepted','active','in_progress','completed')),0) total_revenue
      FROM public.moment_proposals m WHERE m.influencer_id=tm.user_id
    ) mp ON true
    LEFT JOIN LATERAL (
      SELECT COUNT(*) total_applications,
        COUNT(*) FILTER (WHERE c.status='pending') pending_applications,
        COUNT(*) FILTER (WHERE c.status IN ('accepted','active','in_progress')) active_applications
      FROM public.campaign_applications c WHERE c.influencer_id=tm.user_id
    ) ca ON true
    WHERE tm.team_id=target_team_id AND tm.user_id != caller_id
    ORDER BY p.display_name
  ) creator_summary;
  RETURN COALESCE(result, '[]'::json);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_team_proposals(target_team_id UUID)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public VOLATILE AS $$
DECLARE caller_id UUID; result json;
BEGIN
  caller_id := auth.uid();
  IF caller_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.team_members WHERE team_id=target_team_id AND user_id=caller_id)
  THEN RAISE EXCEPTION 'Not a member of this team'; END IF;

  SELECT json_agg(row ORDER BY row.created_at DESC) INTO result FROM (
    SELECT pa.id,'product_application'::text AS proposal_type,pa.status,pa.product_name,pa.price_offer,
      pa.message,pa.created_at,pa.influencer_id,
      inf.display_name AS creator_name, inf.avatar_url AS creator_avatar,
      br.display_name AS brand_name, br.avatar_url AS brand_avatar,
      pa.content_type,pa.brand_condition_confirmed,pa.influencer_condition_confirmed,pa.contract_status,pa.delivery_status
    FROM public.product_applications pa
    JOIN public.profiles inf ON inf.id=pa.influencer_id
    JOIN public.profiles br ON br.id=pa.brand_id
    WHERE pa.influencer_id IN (SELECT user_id FROM public.team_members WHERE team_id=target_team_id AND user_id!=caller_id)
    UNION ALL
    SELECT mp.id,'moment_proposal'::text,mp.status,mp.product_name,mp.price_offer,
      mp.message,mp.created_at,mp.influencer_id,
      inf.display_name,inf.avatar_url,br.display_name,br.avatar_url,
      mp.content_type,mp.brand_condition_confirmed,mp.influencer_condition_confirmed,mp.contract_status,mp.delivery_status
    FROM public.moment_proposals mp
    JOIN public.profiles inf ON inf.id=mp.influencer_id
    JOIN public.profiles br ON br.id=mp.brand_id
    WHERE mp.influencer_id IN (SELECT user_id FROM public.team_members WHERE team_id=target_team_id AND user_id!=caller_id)
    UNION ALL
    SELECT ca.id,'campaign_application'::text,ca.status,c.product_name,ca.price_offer,
      ca.message,ca.created_at,ca.influencer_id,
      inf.display_name,inf.avatar_url,br.display_name,br.avatar_url,
      NULL,NULL::boolean,NULL::boolean,NULL,NULL
    FROM public.campaign_applications ca
    JOIN public.campaigns c ON c.id=ca.campaign_id
    JOIN public.profiles inf ON inf.id=ca.influencer_id
    JOIN public.profiles br ON br.id=c.brand_id
    WHERE ca.influencer_id IN (SELECT user_id FROM public.team_members WHERE team_id=target_team_id AND user_id!=caller_id)
  ) row;
  RETURN COALESCE(result, '[]'::json);
END;
$$;

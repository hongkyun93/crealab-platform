-- =====================================================
-- messages & submission_feedback RLS 완전 재정의
-- 이름 모르는 기존 정책 모두 동적으로 DROP 후 재생성
-- =====================================================

-- ── messages: 모든 기존 정책 동적 제거 ───────────────────────────────────────
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'messages'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.messages', r.policyname);
    END LOOP;
END $$;

-- messages: 새 정책 (컬럼명 참조 없이 단순 auth.uid() 기반)
CREATE POLICY "messages_select"
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "messages_insert"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "messages_update"
  ON public.messages FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);


-- ── submission_feedback: 모든 기존 정책 동적 제거 ────────────────────────────
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'submission_feedback'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.submission_feedback', r.policyname);
    END LOOP;
END $$;

-- submission_feedback: 새 정책
CREATE POLICY "submission_feedback_select"
  ON public.submission_feedback FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "submission_feedback_insert"
  ON public.submission_feedback FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "submission_feedback_update"
  ON public.submission_feedback FOR UPDATE
  USING (auth.uid() = sender_id);

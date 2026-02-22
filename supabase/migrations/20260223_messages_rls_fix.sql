-- =====================================================
-- messages & submission_feedback RLS 정책 재정의
-- brand_proposal_id → product_application_id 컬럼 rename 후
-- 기존 live 정책이 구 컬럼명을 참조해 {} 에러 발생 → 명시적 재정의
-- =====================================================

-- ── messages ─────────────────────────────────────────────────────────────────

-- 기존 정책 전부 제거 (구 컬럼명 참조 정책 포함)
DROP POLICY IF EXISTS "messages_select"              ON public.messages;
DROP POLICY IF EXISTS "messages_insert"              ON public.messages;
DROP POLICY IF EXISTS "messages_update"              ON public.messages;
DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages"       ON public.messages;
DROP POLICY IF EXISTS "Users can update their messages" ON public.messages;
DROP POLICY IF EXISTS "Allow authenticated users to read messages" ON public.messages;
DROP POLICY IF EXISTS "Allow authenticated users to send messages" ON public.messages;
DROP POLICY IF EXISTS "Allow users to read their messages" ON public.messages;
DROP POLICY IF EXISTS "Allow users to send messages" ON public.messages;
DROP POLICY IF EXISTS "Participants can view messages" ON public.messages;
DROP POLICY IF EXISTS "Participants can insert messages" ON public.messages;

-- SELECT: 자신이 보냈거나 받은 메시지
CREATE POLICY "messages_select"
  ON public.messages FOR SELECT
  USING (
    auth.uid() = sender_id
    OR auth.uid() = receiver_id
  );

-- INSERT: 본인이 sender인 메시지만 전송 가능
CREATE POLICY "messages_insert"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
  );

-- UPDATE: 자신이 받은 메시지만 읽음 처리 가능
CREATE POLICY "messages_update"
  ON public.messages FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);


-- ── submission_feedback ────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "submission_feedback_select"  ON public.submission_feedback;
DROP POLICY IF EXISTS "submission_feedback_insert"  ON public.submission_feedback;
DROP POLICY IF EXISTS "Allow authenticated to read feedback"  ON public.submission_feedback;
DROP POLICY IF EXISTS "Allow authenticated to send feedback"  ON public.submission_feedback;
DROP POLICY IF EXISTS "Users can view submission feedback"    ON public.submission_feedback;
DROP POLICY IF EXISTS "Users can send submission feedback"    ON public.submission_feedback;

CREATE POLICY "submission_feedback_select"
  ON public.submission_feedback FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "submission_feedback_insert"
  ON public.submission_feedback FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

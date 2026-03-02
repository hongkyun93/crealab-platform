-- workspaces 테이블 UPDATE RLS 정책 추가
-- 워크스페이스 멤버(brand/creator)가 자신의 워크스페이스를 업데이트할 수 있도록 허용

CREATE POLICY "workspace members can update"
ON public.workspaces
FOR UPDATE
USING (
    (brand_id = auth.uid()) OR (creator_id = auth.uid())
)
WITH CHECK (
    (brand_id = auth.uid()) OR (creator_id = auth.uid())
);

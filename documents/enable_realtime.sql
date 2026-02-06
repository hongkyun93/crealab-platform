-- 실시간 데이터 업데이트(Supabase Realtime) 활성화 스크립트
-- 이 스크립트를 Supabase SQL Editor에서 실행하면 데이터 변경 시 대시보드가 즉시 로그인 없이 업데이트됩니다.

-- 1. 기존 복제 슬롯 확인 및 생성 (기본적으로 활성화되어 있지만 확실히 하기 위함)
ALTER PUBLICATION supabase_realtime ADD TABLE influencer_events;
ALTER PUBLICATION supabase_realtime ADD TABLE campaigns;
ALTER PUBLICATION supabase_realtime ADD TABLE proposals;
ALTER PUBLICATION supabase_realtime ADD TABLE brand_proposals;
ALTER PUBLICATION supabase_realtime ADD TABLE brand_products;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- 2. 이미 존재하는 경우를 대비한 안전한 추가 방식 (오류 무시 가능)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'profiles') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
    END IF;
END $$;

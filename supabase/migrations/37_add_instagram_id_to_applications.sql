-- Add instagram_id to ad_contest_applications
ALTER TABLE public.ad_contest_applications 
ADD COLUMN IF NOT EXISTS instagram_id TEXT;

COMMENT ON COLUMN public.ad_contest_applications.instagram_id IS '크리에이터가 지원 시 입력한 인스타그램 아이디 (@제외)';

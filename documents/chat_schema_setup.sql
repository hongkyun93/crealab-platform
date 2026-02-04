
-- 1. 채팅 메시지 테이블 생성
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  proposal_id uuid references public.brand_proposals(id) on delete cascade,
  sender_id uuid references public.profiles(id),
  receiver_id uuid references public.profiles(id),
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. RLS 설정
alter table public.messages enable row level security;

create policy "Users can view messages they sent or received"
  on public.messages for select
  using ( auth.uid() = sender_id or auth.uid() = receiver_id );

create policy "Users can insert their own messages"
  on public.messages for insert
  with check ( auth.uid() = sender_id );

-- 3. brand_proposals 테이블의 status 제약조건 확인 (이미 존재할 수 있음)
-- 'offered', 'accepted', 'pending', 'rejected' 상태를 사용합니다.

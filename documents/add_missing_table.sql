
-- ==========================================
-- 4. INFLUENCER DETAILS (Extended Profile)
-- ==========================================
create table public.influencer_details (
  id uuid references public.profiles(id) primary key,
  instagram_handle text,
  followers_count integer,
  tier text,
  tags text[],
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.influencer_details enable row level security;

create policy "Influencer details viewable by everyone" on influencer_details for select using ( true );
create policy "Influencers can update own details" on influencer_details for update using ( auth.uid() = id );
create policy "Influencers can insert own details" on influencer_details for insert with check ( auth.uid() = id );

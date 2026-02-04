-- Create a storage bucket for product images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Policy: Allow public access to view images
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'product-images' );

-- Policy: Allow authenticated users to upload images
create policy "Authenticated users can upload images"
  on storage.objects for insert
  with check ( bucket_id = 'product-images' and auth.role() = 'authenticated' );

-- Policy: Allow users to update their own images (optional, simplistic approach)
create policy "Authenticated users can update images"
  on storage.objects for update
  using ( bucket_id = 'product-images' and auth.role() = 'authenticated' );

-- Policy: Allow users to delete images
create policy "Authenticated users can delete images"
  on storage.objects for delete
  using ( bucket_id = 'product-images' and auth.role() = 'authenticated' );

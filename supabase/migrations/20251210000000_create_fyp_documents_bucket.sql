-- Create FYP documents storage bucket
insert into storage.buckets (id, name, public)
values ('fyp-documents', 'fyp-documents', false);

-- Enable RLS for the bucket
create policy "Level 400 students can upload their own FYP documents"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'fyp-documents' and
  (storage.foldername(name))[1] = auth.uid()::text and
  exists (
    select 1 from profiles
    where id = auth.uid() and academic_level in ('400', 'level_400')
  )
);

-- Students can view their own FYP documents
create policy "Students can view their own FYP documents"
on storage.objects for select
to authenticated
using (
  bucket_id = 'fyp-documents' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Staff and admins can view all FYP documents
create policy "Staff and admins can view all FYP documents"
on storage.objects for select
to authenticated
using (
  bucket_id = 'fyp-documents' and
  exists (
    select 1 from profiles
    where id = auth.uid() and role in ('staff', 'admin')
  )
);

-- Students can update their own FYP documents
create policy "Students can update their own FYP documents"
on storage.objects for update
to authenticated
using (
  bucket_id = 'fyp-documents' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Students can delete their own FYP documents
create policy "Students can delete their own FYP documents"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'fyp-documents' and
  (storage.foldername(name))[1] = auth.uid()::text
);

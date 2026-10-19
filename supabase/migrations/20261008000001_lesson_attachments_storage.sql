-- Rows are immutable once created (no update policy, no update grant).
grant select on public.lesson_attachments to anon, authenticated;
grant insert, delete on public.lesson_attachments to authenticated;

alter table public.lesson_attachments
    rename column file_url to storage_path;

alter table public.lesson_attachments
    add column file_size bigint not null check (file_size > 0);

alter table public.lesson_attachments
    add constraint lesson_attachments_storage_path_unique unique (storage_path),
    add constraint lesson_attachments_file_name_length
        check (char_length(file_name) between 1 and 255);

-- At most three attachments per lesson, and the object path must sit inside

create or replace function public.validate_lesson_attachment()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
    v_course_id uuid;
    v_count     integer;
begin
    select lessons.course_id
    into v_course_id
    from public.lessons
    where lessons.id = new.lesson_id
    for update;

    if v_course_id is null then
        raise exception 'Lesson not found'
            using errcode = 'foreign_key_violation';
    end if;

    if new.storage_path !~ (
        '^' || v_course_id::text || '/' || new.lesson_id::text
        || '/[0-9a-f-]{36}\.[a-z0-9]{1,10}$'
    ) then
        raise exception 'Invalid attachment path'
            using errcode = 'check_violation';
    end if;

    select count(*)
    into v_count
    from public.lesson_attachments
    where lesson_attachments.lesson_id = new.lesson_id;

    if v_count >= 3 then
        raise exception 'A lesson can have at most 3 attachments'
            using errcode = 'check_violation';
    end if;

    return new;
end;
$$;

create trigger lesson_attachments_validate
    before insert on public.lesson_attachments
    for each row execute function public.validate_lesson_attachment();

-- Private bucket; size and type limits mirror lib/supabase/lesson-attachments.ts.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'lesson-attachments',
    'lesson-attachments',
    false,
    10485760, -- 10 MiB
    array[
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv',
        'application/zip',
        'application/x-zip-compressed',
        'image/png',
        'image/jpeg',
        'image/webp'
    ]
)
on conflict (id) do nothing;

-- Reading an object is allowed exactly when the matching attachment row is
-- visible — so the lesson_attachments RLS (published+public, author, or
-- enrolled) is the single source of truth. Authors can additionally read
-- objects in their own course folder, which the upload confirmation step
-- needs before the row exists.
create policy "Lesson attachments readable when the attachment is visible"
    on storage.objects
    for select
    using (
        bucket_id = 'lesson-attachments'
        and (
            public.is_admin()
            or exists (
                select 1 from public.lesson_attachments
                where lesson_attachments.storage_path = objects.name
            )
            or exists (
                select 1 from public.courses
                where courses.id::text = (storage.foldername(objects.name))[1]
                and courses.author_id = auth.uid()
            )
        )
    );

create policy "Course author can upload lesson attachments"
    on storage.objects
    for insert
    to authenticated
    with check (
        bucket_id = 'lesson-attachments'
        and array_length(storage.foldername(name), 1) = 2
        and exists (
            select 1 from public.lessons
            join public.courses on courses.id = lessons.course_id
            where courses.id::text = (storage.foldername(name))[1]
            and lessons.id::text = (storage.foldername(name))[2]
            and (courses.author_id = auth.uid() or public.is_admin())
        )
    );

create policy "Course author can delete lesson attachments"
    on storage.objects
    for delete
    to authenticated
    using (
        bucket_id = 'lesson-attachments'
        and (
            public.is_admin()
            or exists (
                select 1 from public.courses
                where courses.id::text = (storage.foldername(name))[1]
                and courses.author_id = auth.uid()
            )
        )
    );

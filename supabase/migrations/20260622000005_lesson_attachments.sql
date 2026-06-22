create table public.lesson_attachments (
    id          uuid        primary key default gen_random_uuid(),
    lesson_id   uuid        not null references public.lessons (id) on delete cascade,
    file_name   text        not null,
    file_url    text        not null,
    file_type   text        not null,
    uploaded_at timestamptz not null default now()
);

create index idx_lesson_attachments_lesson_id on public.lesson_attachments (lesson_id);

alter table public.lesson_attachments enable row level security;

create policy "Attachments viewable if course is accessible"
    on public.lesson_attachments
    for select
    using (
        public.is_admin()
        or exists (
            select 1 from public.lessons
            join public.courses on courses.id = lessons.course_id
            where lessons.id = lesson_attachments.lesson_id
            and (
                (courses.status = 'published' and courses.is_public = true)
                or courses.author_id = auth.uid()
                or exists (
                    select 1 from public.enrollments
                    where enrollments.course_id = courses.id
                    and enrollments.user_id = auth.uid()
                )
            )
        )
    );

create policy "Course author or admin can insert attachments"
    on public.lesson_attachments
    for insert
    to authenticated
    with check (
        public.is_admin()
        or exists (
            select 1 from public.lessons
            join public.courses on courses.id = lessons.course_id
            where lessons.id = lesson_attachments.lesson_id
            and courses.author_id = auth.uid()
        )
    );

create policy "Course author or admin can delete attachments"
    on public.lesson_attachments
    for delete
    to authenticated
    using (
        public.is_admin()
        or exists (
            select 1 from public.lessons
            join public.courses on courses.id = lessons.course_id
            where lessons.id = lesson_attachments.lesson_id
            and courses.author_id = auth.uid()
        )
    );

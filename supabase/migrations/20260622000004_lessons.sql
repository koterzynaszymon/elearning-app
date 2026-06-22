create table public.lessons (
    id          uuid        primary key default gen_random_uuid(),
    course_id   uuid        not null references public.courses (id) on delete cascade,
    title       text        not null,
    content     text,
    order_index integer     not null,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now(),

    unique (course_id, order_index)
);

create index idx_lessons_course_id on public.lessons (course_id);

create trigger lessons_updated_at
    before update on public.lessons
    for each row execute function public.update_updated_at();

alter table public.lessons enable row level security;

create policy "Lessons viewable if course is accessible"
    on public.lessons
    for select
    using (
        public.is_admin()
        or exists (
            select 1 from public.courses
            where courses.id = lessons.course_id
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

create policy "Course author or admin can create lessons"
    on public.lessons
    for insert
    to authenticated
    with check (
        public.is_admin()
        or exists (
            select 1 from public.courses
            where courses.id = lessons.course_id
            and courses.author_id = auth.uid()
        )
    );

create policy "Course author or admin can update lessons"
    on public.lessons
    for update
    to authenticated
    using (
        public.is_admin()
        or exists (
            select 1 from public.courses
            where courses.id = lessons.course_id
            and courses.author_id = auth.uid()
        )
    )
    with check (
        public.is_admin()
        or exists (
            select 1 from public.courses
            where courses.id = lessons.course_id
            and courses.author_id = auth.uid()
        )
    );

create policy "Course author or admin can delete lessons"
    on public.lessons
    for delete
    to authenticated
    using (
        public.is_admin()
        or exists (
            select 1 from public.courses
            where courses.id = lessons.course_id
            and courses.author_id = auth.uid()
        )
    );

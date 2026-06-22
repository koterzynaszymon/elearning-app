create table public.enrollments (
    id          uuid        primary key default gen_random_uuid(),
    user_id     uuid        not null references public.profiles (id) on delete cascade,
    course_id   uuid        not null references public.courses (id) on delete cascade,
    enrolled_at timestamptz not null default now(),

    unique (user_id, course_id)
);

create index idx_enrollments_user_id   on public.enrollments (user_id);
create index idx_enrollments_course_id on public.enrollments (course_id);

alter table public.enrollments enable row level security;

create policy "Users see own enrollments, authors see course enrollments, admins see all"
    on public.enrollments
    for select
    to authenticated
    using (
        auth.uid() = user_id
        or public.is_admin()
        or exists (
            select 1 from public.courses
            where courses.id = enrollments.course_id
            and courses.author_id = auth.uid()
        )
    );

create policy "Users can enroll themselves"
    on public.enrollments
    for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can unenroll themselves, admins can remove any"
    on public.enrollments
    for delete
    to authenticated
    using (auth.uid() = user_id or public.is_admin());

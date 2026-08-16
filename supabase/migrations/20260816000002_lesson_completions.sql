-- A row here means "this learner finished this lesson". Completion is one-way

create table public.lesson_completions (
    user_id      uuid        not null references public.profiles (id) on delete cascade,
    lesson_id    uuid        not null references public.lessons (id) on delete cascade,
    completed_at timestamptz not null default now(),

    primary key (user_id, lesson_id)
);

create index idx_lesson_completions_lesson_id
    on public.lesson_completions (lesson_id);

alter table public.lesson_completions enable row level security;

create policy "Learners see own completions, authors see their courses, admins see all"
    on public.lesson_completions
    for select
    to authenticated
    using (
        auth.uid() = user_id
        or public.is_admin()
        or exists (
            select 1
            from public.lessons
            join public.courses on courses.id = lessons.course_id
            where lessons.id = lesson_completions.lesson_id
            and courses.author_id = auth.uid()
        )
    );

-- Reading a public course needs no enrollment, but recording progress does.
create policy "Learners can complete lessons in courses they joined"
    on public.lesson_completions
    for insert
    to authenticated
    with check (
        auth.uid() = user_id
        and exists (
            select 1
            from public.lessons
            join public.enrollments on enrollments.course_id = lessons.course_id
            where lessons.id = lesson_completions.lesson_id
            and enrollments.user_id = auth.uid()
        )
    );

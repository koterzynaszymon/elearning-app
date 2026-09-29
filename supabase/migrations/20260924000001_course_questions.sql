-- Course-wide Q&A: an enrolled learner can ask a question about a course,
-- the course author answers it, and either the asker or the author can
-- remove it.

create table public.course_questions (
    id          uuid        primary key default gen_random_uuid(),
    course_id   uuid        not null references public.courses (id) on delete cascade,
    user_id     uuid        not null references public.profiles (id) on delete cascade,
    body        text        not null,
    answer      text,
    answered_at timestamptz,
    created_at  timestamptz not null default now(),

    constraint course_questions_body_not_blank check (length(trim(body)) > 0),
    constraint course_questions_answer_not_blank check (answer is null or length(trim(answer)) > 0)
);

create index idx_course_questions_course_id on public.course_questions (course_id);

alter table public.course_questions enable row level security;

create policy "Enrolled learners and the course author can read questions"
    on public.course_questions
    for select
    to authenticated
    using (
        public.is_admin()
        or exists (
            select 1 from public.courses
            where courses.id = course_questions.course_id
            and courses.author_id = auth.uid()
        )
        or exists (
            select 1 from public.enrollments
            where enrollments.course_id = course_questions.course_id
            and enrollments.user_id = auth.uid()
        )
    );

create policy "Enrolled learners can ask a question"
    on public.course_questions
    for insert
    to authenticated
    with check (
        auth.uid() = user_id
        and exists (
            select 1 from public.enrollments
            where enrollments.course_id = course_questions.course_id
            and enrollments.user_id = auth.uid()
        )
    );

-- Answering is modelled as an update: the author sets (or edits) `answer`
-- and `answered_at`. Only the course's own author may update a row.
create policy "Course authors can answer questions in their own courses"
    on public.course_questions
    for update
    to authenticated
    using (
        exists (
            select 1 from public.courses
            where courses.id = course_questions.course_id
            and courses.author_id = auth.uid()
        )
    )
    with check (
        exists (
            select 1 from public.courses
            where courses.id = course_questions.course_id
            and courses.author_id = auth.uid()
        )
    );

create policy "Askers remove their own question, authors moderate their course"
    on public.course_questions
    for delete
    to authenticated
    using (
        auth.uid() = user_id
        or public.is_admin()
        or exists (
            select 1 from public.courses
            where courses.id = course_questions.course_id
            and courses.author_id = auth.uid()
        )
    );

grant select, insert, update, delete on public.course_questions to authenticated;

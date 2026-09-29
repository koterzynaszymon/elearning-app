-- A row is one student's 1-5 star rating of a course. A student rates a
-- course once; rating again updates the same row (see the unique constraint
-- and the update policy below).

create table public.course_ratings (
    id         uuid        primary key default gen_random_uuid(),
    course_id  uuid        not null references public.courses (id) on delete cascade,
    user_id    uuid        not null references public.profiles (id) on delete cascade,
    rating     smallint    not null check (rating between 1 and 5),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    unique (course_id, user_id)
);

create index idx_course_ratings_course_id on public.course_ratings (course_id);

create trigger course_ratings_updated_at
    before update on public.course_ratings
    for each row execute function public.update_updated_at();

alter table public.course_ratings enable row level security;

create policy "Ratings are visible to everyone"
    on public.course_ratings
    for select
    using (true);

-- Rating requires enrollment, same gate as asking a course question.
create policy "Enrolled learners can rate a course"
    on public.course_ratings
    for insert
    to authenticated
    with check (
        auth.uid() = user_id
        and exists (
            select 1 from public.enrollments
            where enrollments.course_id = course_ratings.course_id
            and enrollments.user_id = auth.uid()
        )
    );

create policy "Learners can update their own rating"
    on public.course_ratings
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Learners can remove their own rating"
    on public.course_ratings
    for delete
    to authenticated
    using (auth.uid() = user_id);

grant select on public.course_ratings to anon;
grant select, insert, update, delete on public.course_ratings to authenticated;

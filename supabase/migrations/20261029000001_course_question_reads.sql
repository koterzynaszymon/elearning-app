create table public.course_question_reads (
    user_id      uuid        not null references public.profiles (id) on delete cascade,
    course_id    uuid        not null references public.courses (id) on delete cascade,
    last_seen_at timestamptz not null default now(),

    primary key (user_id, course_id)
);

alter table public.course_question_reads enable row level security;

create policy "Learners can read their own read markers"
    on public.course_question_reads
    for select
    to authenticated
    using (auth.uid() = user_id);

-- Same enrollment gate as asking a question.
create policy "Enrolled learners can create their read marker"
    on public.course_question_reads
    for insert
    to authenticated
    with check (
        auth.uid() = user_id
        and exists (
            select 1 from public.enrollments
            where enrollments.course_id = course_question_reads.course_id
            and enrollments.user_id = auth.uid()
        )
    );

create policy "Learners can move their own read marker"
    on public.course_question_reads
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

grant select, insert, update on public.course_question_reads to authenticated;

create or replace function public.mark_course_answers_seen(p_course_id uuid)
returns timestamptz
language sql
volatile
set search_path = ''
as $$
    insert into public.course_question_reads (user_id, course_id, last_seen_at)
    values (auth.uid(), p_course_id, now())
    on conflict (user_id, course_id)
    do update set last_seen_at = excluded.last_seen_at
    returning last_seen_at;
$$;

revoke all on function public.mark_course_answers_seen(uuid) from public;
grant execute on function public.mark_course_answers_seen(uuid) to authenticated;

create or replace function public.get_unread_answer_counts()
returns table (
    course_id    uuid,
    unread_count integer
)
language sql
stable
set search_path = ''
as $$
    select q.course_id, count(*)::integer
    from public.course_questions q
    left join public.course_question_reads r
        on r.user_id = q.user_id
        and r.course_id = q.course_id
    where q.user_id = auth.uid()
    and q.answered_at is not null
    and (r.last_seen_at is null or q.answered_at > r.last_seen_at)
    group by q.course_id;
$$;

revoke all on function public.get_unread_answer_counts() from public;
grant execute on function public.get_unread_answer_counts() to authenticated;

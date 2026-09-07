-- Lets a course author manage the learners enrolled in their own course:
--   1. remove a learner (delete their enrollment)
--   2. read the roster with per-learner completion counts for progress tracking
--
-- The existing enrollments DELETE policy only covers "a learner removing
-- themselves" and admins. RLS permissive policies are OR'd, so this adds the
-- author case without touching the learner/admin policy.

create policy "Course authors can remove learners from their courses"
    on public.enrollments
    for delete
    to authenticated
    using (
        exists (
            select 1 from public.courses
            where courses.id = enrollments.course_id
            and courses.author_id = auth.uid()
        )
    );

-- SECURITY DEFINER so completion counts across every learner are accurate:
-- lesson_completions RLS already exposes an author's own courses, but the
-- aggregate is simpler to express — and cheaper — in one trusted query. The
-- function is inert for anyone who is not the course author (the roster comes
-- back empty), so it needs no extra guard beyond the ownership check.
create or replace function public.get_course_roster(p_course_id uuid)
returns table (
    user_id           uuid,
    display_name      text,
    username          text,
    email             text,
    enrolled_at       timestamptz,
    completed_lessons integer,
    total_lessons     integer
)
language sql
stable
security definer
set search_path = ''
as $$
    with owned as (
        select 1
        from public.courses c
        where c.id = p_course_id
        and c.author_id = auth.uid()
    ),
    lesson_total as (
        select count(*)::integer as n
        from public.lessons l
        where l.course_id = p_course_id
    )
    select
        e.user_id,
        coalesce(
            nullif(
                trim(
                    concat_ws(
                        ' ',
                        nullif(trim(p.first_name), ''),
                        nullif(trim(p.last_name), '')
                    )
                ),
                ''
            ),
            p.username,
            'Unknown learner'
        ) as display_name,
        p.username,
        p.email,
        e.enrolled_at,
        (
            select count(*)::integer
            from public.lesson_completions lc
            join public.lessons l on l.id = lc.lesson_id
            where l.course_id = p_course_id
            and lc.user_id = e.user_id
        ) as completed_lessons,
        (select n from lesson_total) as total_lessons
    from public.enrollments e
    join public.profiles p on p.id = e.user_id
    where e.course_id = p_course_id
    and exists (select 1 from owned)
    order by e.enrolled_at desc;
$$;

revoke all on function public.get_course_roster(uuid) from public;
grant execute on function public.get_course_roster(uuid) to authenticated;

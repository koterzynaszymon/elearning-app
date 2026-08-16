create or replace function public.get_course_progress(p_course_id uuid)
returns table (
    course_id       uuid,
    course_title    text,
    description     text,
    is_public       boolean,
    is_enrolled     boolean,
    lesson_id       uuid,
    lesson_title    text,
    lesson_content  text,
    lesson_position integer,
    is_completed    boolean
)
language sql
stable
set search_path = ''
as $$
    select
        c.id,
        c.title,
        c.description,
        c.is_public,
        exists (
            select 1
            from public.enrollments e
            where e.course_id = c.id
            and e.user_id = auth.uid()
        ),
        l.id,
        l.title,
        l.content,
        (row_number() over (partition by c.id order by l.order_index))::integer,
        exists (
            select 1
            from public.lesson_completions lc
            where lc.lesson_id = l.id
            and lc.user_id = auth.uid()
        )
    from public.courses c
    left join public.lessons l on l.course_id = c.id
    where c.id = p_course_id
    and c.status = 'published'
    order by l.order_index;
$$;

revoke all on function public.get_course_progress(uuid) from public;
grant execute on function public.get_course_progress(uuid) to authenticated;

-- Everything the My Courses page needs, newest activity first.
create or replace function public.get_enrolled_courses()
returns table (
    course_id         uuid,
    course_title      text,
    description       text,
    author_name       text,
    is_public         boolean,
    lesson_count      integer,
    completed_lessons integer,
    enrolled_at       timestamptz,
    last_activity_at  timestamptz
)
language sql
stable
set search_path = ''
as $$
    with mine as (
        select e.course_id, e.enrolled_at
        from public.enrollments e
        where e.user_id = auth.uid()
    ),
    progress as (
        select
            l.course_id      as course_id,
            count(*)::integer as done_count,
            max(lc.completed_at) as latest_at
        from public.lesson_completions lc
        join public.lessons l on l.id = lc.lesson_id
        where lc.user_id = auth.uid()
        group by l.course_id
    )
    select
        c.id,
        c.title,
        c.description,
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
            'Unknown instructor'
        ),
        c.is_public,
        (
            select count(*)::integer
            from public.lessons l2
            where l2.course_id = c.id
        ),
        coalesce(pr.done_count, 0),
        m.enrolled_at,
        pr.latest_at
    from mine m
    join public.courses c on c.id = m.course_id
    join public.profiles p on p.id = c.author_id
    left join progress pr on pr.course_id = c.id
    order by coalesce(pr.latest_at, m.enrolled_at) desc;
$$;

revoke all on function public.get_enrolled_courses() from public;
grant execute on function public.get_enrolled_courses() to authenticated;

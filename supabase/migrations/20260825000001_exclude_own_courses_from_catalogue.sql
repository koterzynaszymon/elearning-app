create or replace function public.get_published_catalogue()
returns table (
    id            uuid,
    title         text,
    description   text,
    is_public     boolean,
    updated_at    timestamptz,
    author_name   text,
    lesson_count  integer,
    student_count integer
)
language sql
stable
security definer
set search_path = ''
as $$
    select
        c.id,
        c.title,
        c.description,
        c.is_public,
        c.updated_at,
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
        ) as author_name,
        (
            select count(*)::integer
            from public.lessons l
            where l.course_id = c.id
        ) as lesson_count,
        (
            select count(*)::integer
            from public.enrollments e
            where e.course_id = c.id
        ) as student_count
    from public.courses c
    join public.profiles p on p.id = c.author_id
    where c.status = 'published'
        and c.author_id is distinct from auth.uid()
    order by c.updated_at desc;
$$;

revoke all on function public.get_published_catalogue() from public;
grant execute on function public.get_published_catalogue() to authenticated;
grant execute on function public.get_published_catalogue() to anon;

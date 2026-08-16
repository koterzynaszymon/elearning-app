-- Two invariants that completion counts depend on, moved from the server actions
-- into the database:
--   1. nobody can be enrolled in a course that is not published
--   2. a published curriculum cannot be restructured under its learners

-- Enrollment requires a published course.
drop policy "Users can enroll themselves" on public.enrollments;

create policy "Users can enroll themselves in published courses"
    on public.enrollments
    for insert
    to authenticated
    with check (
        auth.uid() = user_id
        and exists (
            select 1 from public.courses
            where courses.id = enrollments.course_id
            and courses.status = 'published'
        )
    );

-- Lessons may only be added or removed while the course is a draft.
drop policy "Course author or admin can create lessons" on public.lessons;

create policy "Author or admin can create lessons in drafts"
    on public.lessons
    for insert
    to authenticated
    with check (
        public.is_admin()
        or exists (
            select 1 from public.courses
            where courses.id = lessons.course_id
            and courses.author_id = auth.uid()
            and courses.status = 'draft'
        )
    );

drop policy "Course author or admin can delete lessons" on public.lessons;

create policy "Author or admin can delete lessons from drafts"
    on public.lessons
    for delete
    to authenticated
    using (
        public.is_admin()
        or exists (
            select 1 from public.courses
            where courses.id = lessons.course_id
            and courses.author_id = auth.uid()
            and courses.status = 'draft'
        )
    );

create or replace function public.reject_published_lesson_reorder()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
    if new.order_index is distinct from old.order_index
        and exists (
            select 1 from public.courses
            where courses.id = old.course_id
            and courses.status = 'published'
        )
    then
        raise exception
            'Lesson order cannot change once the course is published'
            using errcode = 'check_violation';
    end if;

    return new;
end;
$$;

create trigger lessons_freeze_order_when_published
    before update on public.lessons
    for each row execute function public.reject_published_lesson_reorder();

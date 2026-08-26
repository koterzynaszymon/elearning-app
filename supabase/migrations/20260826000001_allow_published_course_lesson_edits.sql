drop policy "Author or admin can create lessons in drafts" on public.lessons;

create policy "Author or admin can create lessons"
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

drop policy "Author or admin can delete lessons from drafts" on public.lessons;

create policy "Author or admin can delete lessons"
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

create table public.courses (
    id            uuid        primary key default gen_random_uuid(),
    author_id     uuid        not null references public.profiles (id) on delete cascade,
    title         text        not null,
    slug          text        not null,
    description   text,
    is_public     boolean     not null default true,
    password_hash text,
    status        text        not null default 'draft'
                              check (status in ('draft', 'published')),
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now(),

    unique (author_id, slug),
    constraint private_course_requires_password
        check (is_public = true or password_hash is not null)
);

create index idx_courses_author_id on public.courses (author_id);

create trigger courses_updated_at
    before update on public.courses
    for each row execute function public.update_updated_at();

alter table public.courses enable row level security;

create policy "All courses are visible"
    on public.courses
    for select
    using (true);

create policy "Authenticated users can create courses"
    on public.courses
    for insert
    to authenticated
    with check (auth.uid() = author_id);

create policy "Author or admin can update courses"
    on public.courses
    for update
    to authenticated
    using  (auth.uid() = author_id or public.is_admin())
    with check (auth.uid() = author_id or public.is_admin());

create policy "Author or admin can delete courses"
    on public.courses
    for delete
    to authenticated
    using (auth.uid() = author_id or public.is_admin());

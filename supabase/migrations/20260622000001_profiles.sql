create or replace function public.update_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create table public.profiles (
    id         uuid        primary key references auth.users (id) on delete cascade,
    username   text        not null unique,
    first_name text,
    last_name  text,
    email      text,
    bio        text,
    avatar_url text,
    role       text        not null default 'student'
                           check (role in ('student', 'admin')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create trigger profiles_updated_at
    before update on public.profiles
    for each row execute function public.update_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (id, email, role, username)
    values (
        new.id,
        new.email,
        'student',
        'user_' || left(new.id::text, 8)
    );
    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
as $$
    select exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'admin'
    );
$$;

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
    on public.profiles
    for select
    using (true);

create policy "Users can update own profile, admins can update any"
    on public.profiles
    for update
    to authenticated
    using (auth.uid() = id or public.is_admin())
    with check (
        case
            when public.is_admin() then true
            else role = (select p.role from public.profiles p where p.id = auth.uid())
        end
    );

-- Adds a fixed category and difficulty level to courses so the explore
-- catalogue can filter on them. Existing courses default to 'other' /
-- 'beginner' until their author sets something more specific.

alter table public.courses
    add column category text not null default 'other'
        check (category in (
            'programming',
            'design',
            'business',
            'marketing',
            'personal-development',
            'other'
        )),
    add column level text not null default 'beginner'
        check (level in ('beginner', 'intermediate', 'advanced'));

create index idx_courses_category on public.courses (category);
create index idx_courses_level on public.courses (level);

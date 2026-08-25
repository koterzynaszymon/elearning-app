-- Base table-level grants for anon/authenticated. RLS policies decide which
-- rows are visible; these grants decide which operations a role may attempt
-- at all. Without them, every direct .from(...) query fails with
-- "permission denied for table X" before RLS is ever evaluated.

grant usage on schema public to anon, authenticated;

-- profiles: readable by everyone, editable by the owner (see 20260622000001_profiles.sql).
grant select on public.profiles to anon, authenticated;
grant update on public.profiles to authenticated;

-- courses: catalogue is public, authoring is restricted to the author (see 20260622000002_courses.sql).
grant select on public.courses to anon, authenticated;
grant insert, update, delete on public.courses to authenticated;

-- enrollments: only ever touched by an authenticated learner acting on their own row (see 20260622000003_enrollments.sql).
grant select, insert, delete on public.enrollments to authenticated;

-- lessons: visible pre-enrollment for public courses, authored by the course owner (see 20260622000004_lessons.sql).
grant select on public.lessons to anon, authenticated;
grant insert, update, delete on public.lessons to authenticated;

-- lesson_completions: an authenticated learner records their own progress; no anon or delete policy exists (see 20260816000002_lesson_completions.sql).
grant select, insert on public.lesson_completions to authenticated;

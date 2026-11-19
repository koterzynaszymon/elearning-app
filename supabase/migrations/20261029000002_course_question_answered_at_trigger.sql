
create or replace function public.stamp_question_answered_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if new.answer is null then
        new.answered_at := null;
    elsif tg_op = 'INSERT' or new.answer is distinct from old.answer then
        new.answered_at := now();
    else
        -- Answer unchanged: keep the stamp, or heal a row that never got one.
        new.answered_at := coalesce(old.answered_at, now());
    end if;
    return new;
end;
$$;

create trigger course_questions_answered_at
    before insert or update on public.course_questions
    for each row execute function public.stamp_question_answered_at();

-- Rows answered before this trigger existed but never stamped.
update public.course_questions
set answered_at = now()
where answer is not null and answered_at is null;

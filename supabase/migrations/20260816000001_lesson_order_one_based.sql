-- Lesson positions become 1-based so they can be used directly as URL segments ex. lesson/1,

do $$
declare
    existing_constraint text;
begin
    select con.conname
    into existing_constraint
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'lessons'
      and con.contype = 'u';

    if existing_constraint is not null then
        execute format(
            'alter table public.lessons drop constraint %I',
            existing_constraint
        );
    end if;
end $$;

alter table public.lessons
    add constraint lessons_course_order_unique
        unique (course_id, order_index)
        deferrable initially deferred;

update public.lessons
set order_index = order_index + 1;

set constraints all immediate;

alter table public.lessons
    add constraint lessons_order_index_positive
        check (order_index >= 1);

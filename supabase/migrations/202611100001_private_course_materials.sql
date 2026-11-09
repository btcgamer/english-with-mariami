-- This is a new isolated store. Existing lessons/progress policies are not changed blindly.
create table public.paid_course_materials (
  resource text primary key check (
    resource ~ '^supplementary/grade([1-9]|1[0-2])\.json$' or
    resource ~ '^curriculum/grade([1-9]|1[0-2])-world([1-9]|10)\.json$'
  ),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now()
);
alter table public.paid_course_materials enable row level security;
revoke all on public.paid_course_materials from public, anon, authenticated;
grant select, insert, update, delete on public.paid_course_materials to service_role;
-- No anon/authenticated policies: read only through paid-course after server verification.

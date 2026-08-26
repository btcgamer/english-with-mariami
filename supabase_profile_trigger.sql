-- English with Mariami
-- Creates a public student profile automatically after Supabase Auth signup.
-- Run this once in Supabase SQL Editor.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_grade integer;
  selected_name text;
begin
  selected_name := nullif(trim(new.raw_user_meta_data->>'full_name'), '');

  begin
    selected_grade := (new.raw_user_meta_data->>'grade')::integer;
  exception when others then
    selected_grade := null;
  end;

  -- Public registration can only create student profiles.
  -- Never trust a client-supplied role such as "admin".
  if selected_grade not in (2, 3, 4) then
    selected_grade := null;
  end if;

  insert into public.profiles (user_id, full_name, grade, role, points)
  values (
    new.id,
    coalesce(selected_name, ''),
    selected_grade,
    'student',
    0
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

-- Recommended RLS policy for profiles.
-- The trigger runs as security definer, so signup does not need
-- an authenticated INSERT policy on profiles.
alter table public.profiles enable row level security;

drop policy if exists "Users can create their own profile" on public.profiles;

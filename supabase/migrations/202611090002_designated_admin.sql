-- Run with a trusted database administrator in the intended Supabase project.
-- Never run through a public/anonymous browser client. This does not create users,
-- confirm email addresses, trust user_metadata.role, or demote existing admins.
begin;
do $$
declare
  account_id uuid;
  changed integer;
begin
  select id into strict account_id
    from auth.users
    where lower(email) = 'datogringo@gmail.com'
      and email_confirmed_at is not null
    for update;

  update public.profiles set role = 'admin' where user_id = account_id;
  get diagnostics changed = row_count;
  if changed <> 1 then
    raise exception 'Expected exactly one existing profile for the designated admin; no changes applied';
  end if;
  -- Auth app metadata is server-managed. Do not use user-editable user metadata.
  update auth.users
    set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('mariami_admin', true)
    where id = account_id;
exception
  when no_data_found then
    raise exception 'The designated admin must already have a verified account in this project; no changes applied';
  when too_many_rows then
    raise exception 'Multiple accounts match the designated email; no changes applied';
end;
$$;
select u.email, p.role, u.raw_app_meta_data->>'mariami_admin' as verified_admin
from auth.users u join public.profiles p on p.user_id = u.id
where lower(u.email) = 'datogringo@gmail.com';
commit;

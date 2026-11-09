-- Apply to the existing project only after reviewing the deployment configuration.
-- Purchase tokens are credentials: never expose this table through an authenticated-user policy.
create table public.play_purchase_tokens (
  token_hash text primary key check (token_hash ~ '^[a-f0-9]{64}$'),
  user_id uuid not null references auth.users(id) on delete cascade,
  purchase_token text not null,
  created_at timestamptz not null default now()
);
create index play_purchase_tokens_user_idx on public.play_purchase_tokens(user_id);
alter table public.play_purchase_tokens enable row level security;
revoke all on public.play_purchase_tokens from anon, authenticated;
grant select, insert, update, delete on public.play_purchase_tokens to service_role;

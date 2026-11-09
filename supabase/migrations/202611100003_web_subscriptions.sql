create table public.web_checkout_intents (
 id uuid primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 plan text not null check (plan in ('monthly','quarterly','half-yearly','yearly')),
 variant_id text not null check (variant_id ~ '^[0-9]+$'),
 test_mode boolean not null,
 expires_at timestamptz not null,
 created_at timestamptz not null default now()
);
create index web_checkout_intents_user_idx on public.web_checkout_intents(user_id);
create table public.web_subscriptions (
 provider_subscription_id text primary key check (provider_subscription_id ~ '^[0-9]+$'),
 user_id uuid not null references auth.users(id) on delete cascade,
 plan text not null check (plan in ('monthly','quarterly','half-yearly','yearly')),
 variant_id text not null check (variant_id ~ '^[0-9]+$'),
 status text not null,
 valid_until timestamptz,
 provider_updated_at timestamptz not null,
 test_mode boolean not null,
 blocked boolean not null default false,
 billing_event_at timestamptz,
 created_at timestamptz not null default now()
);
create index web_subscriptions_user_idx on public.web_subscriptions(user_id);
create table public.web_billing_events (
 event_hash text primary key check (event_hash ~ '^[a-f0-9]{64}$'),
 provider_subscription_id text not null,
 received_at timestamptz not null default now()
);
alter table public.web_checkout_intents enable row level security;
alter table public.web_subscriptions enable row level security;
alter table public.web_billing_events enable row level security;
revoke all on public.web_checkout_intents, public.web_subscriptions, public.web_billing_events from public, anon, authenticated;
grant select, insert, update, delete on public.web_checkout_intents, public.web_subscriptions, public.web_billing_events to service_role;

-- A signature alone is not enough to grant access: the handler rechecks the provider API.
-- This service-only transaction then enforces ownership, replay protection and ordering.
create function public.apply_web_subscription_event(
 p_event_hash text, p_subscription_id text, p_user_id uuid, p_plan text,
 p_variant_id text, p_status text, p_valid_until timestamptz,
 p_provider_updated_at timestamptz, p_test_mode boolean,
 p_intent_id uuid default null, p_billing_at timestamptz default null,
 p_refunded boolean default null
) returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare
 current_row public.web_subscriptions%rowtype;
 inserted_count integer;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_subscription_id,0));
 insert into public.web_billing_events(event_hash,provider_subscription_id)
 values(p_event_hash,p_subscription_id) on conflict do nothing;
 get diagnostics inserted_count=row_count;
 if inserted_count=0 then return false; end if;
 select * into current_row from public.web_subscriptions where provider_subscription_id=p_subscription_id for update;
 if found then
  if current_row.user_id<>p_user_id or current_row.test_mode<>p_test_mode then raise exception 'Subscription ownership or mode mismatch'; end if;
 else
  if not exists(select 1 from public.web_checkout_intents where id=p_intent_id and user_id=p_user_id and test_mode=p_test_mode and plan=p_plan and variant_id=p_variant_id) then
   raise exception 'A server-created checkout intent is required';
  end if;
  insert into public.web_subscriptions(provider_subscription_id,user_id,plan,variant_id,status,valid_until,provider_updated_at,test_mode)
  values(p_subscription_id,p_user_id,p_plan,p_variant_id,p_status,p_valid_until,p_provider_updated_at,p_test_mode);
 end if;
 update public.web_subscriptions set plan=p_plan,variant_id=p_variant_id,status=p_status,
 valid_until=p_valid_until,provider_updated_at=p_provider_updated_at
 where provider_subscription_id=p_subscription_id and provider_updated_at<=p_provider_updated_at;
 if p_refunded is not null and p_billing_at is not null then
  update public.web_subscriptions set blocked=p_refunded,billing_event_at=p_billing_at
  where provider_subscription_id=p_subscription_id and (billing_event_at is null or billing_event_at<p_billing_at or (billing_event_at=p_billing_at and p_refunded));
 end if;
 return true;
end;
$$;
revoke all on function public.apply_web_subscription_event(text,text,uuid,text,text,text,timestamptz,timestamptz,boolean,uuid,timestamptz,boolean) from public,anon,authenticated;
grant execute on function public.apply_web_subscription_event(text,text,uuid,text,text,text,timestamptz,timestamptz,boolean,uuid,timestamptz,boolean) to service_role;

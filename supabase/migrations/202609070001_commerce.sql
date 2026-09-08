-- Private commerce data: browser roles have no table or function access.
create table public.commerce_reports (
 id uuid primary key default gen_random_uuid(),
 title text not null,
 storage_path text not null unique,
 ready boolean not null default false,
 available_until timestamptz not null,
 created_at timestamptz not null default now()
);
create table public.commerce_orders (
 id uuid primary key default gen_random_uuid(),
 user_id uuid references auth.users(id),
 email text not null,
 plan_id text not null check(plan_id in ('report','pack')),
 amount integer not null check(amount > 0),
 credits integer not null check(credits in (1,3)),
 status text not null default 'pending' check(status in ('pending','submitted','approved','rejected','cancelled','refunded','charged_back')),
 payment_id text unique,
 payment_updated_at timestamptz,
 payment_checked_at timestamptz,
 initial_report_id uuid not null references public.commerce_reports(id),
 created_at timestamptz not null default now(),
 paid_at timestamptz,
 expires_at timestamptz,
 email_sent_at timestamptz,
 email_claimed_at timestamptz
);
create index commerce_orders_user_idx on public.commerce_orders(user_id, created_at desc);
create index commerce_orders_guest_idx on public.commerce_orders(lower(email)) where user_id is null;
create table public.commerce_redemptions (
 order_id uuid not null references public.commerce_orders(id),
 report_id uuid not null references public.commerce_reports(id),
 created_at timestamptz not null default now(),
 email_sent_at timestamptz,
 email_claimed_at timestamptz,
 primary key(order_id, report_id)
);
alter table public.commerce_orders enable row level security;
alter table public.commerce_reports enable row level security;
alter table public.commerce_redemptions enable row level security;
revoke all on public.commerce_orders, public.commerce_reports, public.commerce_redemptions from anon, authenticated;
grant all on public.commerce_orders, public.commerce_reports, public.commerce_redemptions to service_role;

-- Serialize notifications; compare authoritative provider timestamps, not arrival order.
create function public.commerce_apply_payment(p_order uuid, p_payment text, p_status text, p_updated timestamptz)
returns void language plpgsql security definer set search_path = public as $$
declare o commerce_orders;
begin
 select * into o from commerce_orders where id=p_order for update;
 if not found then raise exception 'order_missing'; end if;
 if o.payment_id is not null and o.payment_id <> p_payment then raise exception 'payment_mismatch'; end if;
 if o.payment_updated_at is not null and p_updated < o.payment_updated_at then return; end if;
 if o.payment_updated_at = p_updated and p_status = o.status then return; end if;
 if o.status='approved' and p_status in ('pending','submitted','rejected','cancelled') then return; end if;
 -- Revocation cannot be undone by delayed approval events.
 if o.status in ('refunded','charged_back') and p_status not in ('refunded','charged_back') then return; end if;
 update commerce_orders set payment_id=p_payment, status=p_status, payment_updated_at=p_updated,
 paid_at=case when p_status='approved' then coalesce(paid_at,now()) else paid_at end,
 expires_at=case when p_status='approved' then coalesce(expires_at,now()+interval '90 days') else expires_at end where id=p_order;
 if p_status='approved' then
  insert into commerce_redemptions(order_id,report_id) values(p_order,o.initial_report_id) on conflict do nothing;
 end if;
end $$;

-- Atomic credit reservation: failures cannot overspend a pack.
create function public.commerce_redeem(p_order uuid, p_report uuid)
returns void language plpgsql security definer set search_path = public as $$
declare o commerce_orders;
begin
 select * into o from commerce_orders where id=p_order for update;
 if not found or o.status <> 'approved' then raise exception 'not_paid'; end if;
 if exists(select 1 from commerce_redemptions where order_id=p_order and report_id=p_report) then return; end if;
 if o.expires_at <= now() then raise exception 'credits_expired'; end if;
 if not exists(select 1 from commerce_reports where id=p_report and ready and available_until>now()) then raise exception 'report_unavailable'; end if;
 if (select count(*) from commerce_redemptions where order_id=p_order)>=o.credits then raise exception 'no_credits'; end if;
 insert into commerce_redemptions(order_id,report_id) values(p_order,p_report);
end $$;

revoke all on function public.commerce_apply_payment(uuid,text,text,timestamptz), public.commerce_redeem(uuid,uuid) from public,anon,authenticated;
grant execute on function public.commerce_apply_payment(uuid,text,text,timestamptz), public.commerce_redeem(uuid,uuid) to service_role;

create table public.commerce_rate_buckets (
 key text primary key, window_start timestamptz not null, attempts integer not null
);
alter table public.commerce_rate_buckets enable row level security;
revoke all on public.commerce_rate_buckets from anon,authenticated;
grant all on public.commerce_rate_buckets to service_role;
create function public.commerce_rate_limit(p_key text,p_limit integer)
returns boolean language plpgsql security definer set search_path = public as $$
declare n integer;
begin
 insert into commerce_rate_buckets(key,window_start,attempts) values(p_key,now(),1)
 on conflict(key) do update set
 attempts=case when commerce_rate_buckets.window_start < now()-interval '15 minutes' then 1 else commerce_rate_buckets.attempts+1 end,
 window_start=case when commerce_rate_buckets.window_start < now()-interval '15 minutes' then now() else commerce_rate_buckets.window_start end
 returning attempts into n;
 return n<=p_limit;
end $$;
revoke all on function public.commerce_rate_limit(text,integer) from public,anon,authenticated;
grant execute on function public.commerce_rate_limit(text,integer) to service_role;

create index commerce_payment_reconcile_idx on public.commerce_orders(payment_checked_at nulls first) where status in ('submitted','approved');
create index commerce_delivery_idx on public.commerce_redemptions(created_at) where email_sent_at is null;

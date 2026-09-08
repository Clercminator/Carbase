create table public.commerce_subscriptions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id),
 email text not null,
 amount integer not null default 29990 check(amount=29990),
 status text not null default 'submitted' check(status in ('submitted','pending','authorized','paused','cancelled')),
 provider_id text unique,
 provider_updated_at timestamptz,
 next_payment_at timestamptz,
 cancel_requested boolean not null default false,
 checked_at timestamptz,
 invoice_offset integer not null default 0 check(invoice_offset>=0),
 created_at timestamptz not null default now()
);
create unique index commerce_one_subscription on public.commerce_subscriptions(user_id) where status<>'cancelled';
create index commerce_subscription_scan on public.commerce_subscriptions(checked_at nulls first);
alter table public.commerce_subscriptions enable row level security;
revoke all on public.commerce_subscriptions from public,anon,authenticated;
grant all on public.commerce_subscriptions to service_role;

alter table public.commerce_orders drop constraint commerce_orders_plan_id_check;
alter table public.commerce_orders drop constraint commerce_orders_credits_check;
alter table public.commerce_orders alter column initial_report_id drop not null;
alter table public.commerce_orders add column subscription_id uuid references public.commerce_subscriptions(id);
alter table public.commerce_orders add column invoice_id text unique;
alter table public.commerce_orders add column cycle_start timestamptz;
alter table public.commerce_orders add constraint commerce_order_product check (
 (plan_id='report' and credits=1 and initial_report_id is not null and subscription_id is null) or
 (plan_id='pack' and credits=3 and initial_report_id is not null and subscription_id is null) or
 (plan_id='pro' and credits=30 and amount=29990 and user_id is not null and initial_report_id is null and subscription_id is not null and invoice_id is not null and cycle_start is not null and expires_at>cycle_start)
);
create unique index commerce_one_monthly_cycle on public.commerce_orders(subscription_id,cycle_start) where subscription_id is not null;

create function public.commerce_sync_subscription(p_id uuid,p_provider text,p_status text,p_updated timestamptz,p_next timestamptz)
returns void language plpgsql security definer set search_path='' as $$
declare s public.commerce_subscriptions;
begin
 select * into s from public.commerce_subscriptions where id=p_id for update;
 if not found then raise exception 'subscription_missing'; end if;
 if s.provider_id is not null and s.provider_id<>p_provider then raise exception 'subscription_mismatch'; end if;
 if p_status not in ('pending','authorized','paused','cancelled') or p_updated is null then raise exception 'invalid_subscription'; end if;
 if s.provider_updated_at>p_updated or s.status='cancelled' then return; end if;
 update public.commerce_subscriptions set provider_id=p_provider,status=p_status,provider_updated_at=p_updated,next_payment_at=p_next where id=p_id;
end $$;

create function public.commerce_apply_invoice(p_subscription uuid,p_invoice text,p_payment text,p_status text,p_updated timestamptz,p_start timestamptz)
returns uuid language plpgsql security definer set search_path='' as $$
declare s public.commerce_subscriptions; o public.commerce_orders; oid uuid;
begin
 select * into s from public.commerce_subscriptions where id=p_subscription for update;
 if not found or s.provider_id is null then raise exception 'subscription_missing'; end if;
 if p_status not in ('submitted','approved','rejected','cancelled','refunded','charged_back') or p_start is null or p_updated is null then raise exception 'invalid_invoice'; end if;
 select * into o from public.commerce_orders where invoice_id=p_invoice for update;
 if found then
  if o.subscription_id<>p_subscription or o.cycle_start<>p_start then raise exception 'invoice_mismatch'; end if;
  -- A provider retry can replace a rejected payment; never replace a settled one.
  if o.payment_id<>p_payment and o.status not in ('submitted','rejected','cancelled') then raise exception 'invoice_payment_mismatch'; end if;
  if o.payment_updated_at>p_updated or o.status in ('refunded','charged_back') then return o.id; end if;
  if o.status='approved' and p_status in ('submitted','rejected','cancelled') then return o.id; end if;
  update public.commerce_orders set payment_id=p_payment,status=p_status,payment_updated_at=p_updated,paid_at=case when p_status='approved' then coalesce(paid_at,now()) else paid_at end where id=o.id;
  return o.id;
 end if;
 insert into public.commerce_orders(user_id,email,plan_id,amount,credits,status,payment_id,payment_updated_at,subscription_id,invoice_id,cycle_start,expires_at,paid_at)
 values(s.user_id,s.email,'pro',s.amount,30,p_status,p_payment,p_updated,s.id,p_invoice,p_start,(p_start at time zone 'UTC'+interval '1 month') at time zone 'UTC',case when p_status='approved' then now() end) returning id into oid;
 return oid;
end $$;

-- Single purchases retain their original 90-day behavior; monthly cycles use their own RPC.
create or replace function public.commerce_apply_payment(p_order uuid,p_payment text,p_status text,p_updated timestamptz)
returns void language plpgsql security definer set search_path=public as $$
declare o commerce_orders;
begin
 select * into o from commerce_orders where id=p_order for update;
 if not found or o.subscription_id is not null then raise exception 'order_missing'; end if;
 if o.payment_id is not null and o.payment_id<>p_payment then raise exception 'payment_mismatch'; end if;
 if o.payment_updated_at>p_updated then return; end if;
 if o.payment_updated_at=p_updated and p_status=o.status then return; end if;
 if o.status='approved' and p_status in ('pending','submitted','rejected','cancelled') then return; end if;
 if o.status in ('refunded','charged_back') and p_status not in ('refunded','charged_back') then return; end if;
 update commerce_orders set payment_id=p_payment,status=p_status,payment_updated_at=p_updated,
 paid_at=case when p_status='approved' then coalesce(paid_at,now()) else paid_at end,
 expires_at=case when p_status='approved' then coalesce(expires_at,now()+interval '90 days') else expires_at end where id=p_order;
 if p_status='approved' then insert into commerce_redemptions(order_id,report_id) values(p_order,o.initial_report_id) on conflict do nothing; end if;
end $$;

create or replace function public.commerce_redeem(p_order uuid,p_report uuid)
returns void language plpgsql security definer set search_path=public as $$
declare o commerce_orders;
begin
 select * into o from commerce_orders where id=p_order for update;
 if not found or o.status<>'approved' then raise exception 'not_paid'; end if;
 if exists(select 1 from commerce_redemptions where order_id=p_order and report_id=p_report) then return; end if;
 if o.expires_at<=now() or o.cycle_start>now() then raise exception 'credits_expired'; end if;
 if not exists(select 1 from commerce_reports where id=p_report and ready and available_until>now()) then raise exception 'report_unavailable'; end if;
 if (select count(*) from commerce_redemptions where order_id=p_order)>=o.credits then raise exception 'no_credits'; end if;
 insert into commerce_redemptions(order_id,report_id) values(p_order,p_report);
end $$;
revoke all on function public.commerce_sync_subscription(uuid,text,text,timestamptz,timestamptz),public.commerce_apply_invoice(uuid,text,text,text,timestamptz,timestamptz) from public,anon,authenticated;
grant execute on function public.commerce_sync_subscription(uuid,text,text,timestamptz,timestamptz),public.commerce_apply_invoice(uuid,text,text,text,timestamptz,timestamptz) to service_role;

-- Installed explicitly by commerce:scheduler. Credentials are supplied through Vault.
create table if not exists commerce_private.recovery_requests (
 request_id bigint primary key,
 created_at timestamptz not null default now()
);
revoke all on commerce_private.recovery_requests from public, anon, authenticated;

create or replace function commerce_private.dispatch_recovery(force_probe boolean default false)
returns bigint language plpgsql security invoker set search_path = '' as $$
declare request bigint;
begin
 -- Keep operational metadata bounded; pg_net retains responses for only a short period.
 delete from commerce_private.recovery_requests where created_at < now() - interval '7 days';
 delete from cron.job_run_details where jobid in (
  select jobid from cron.job where jobname = 'carbase-commerce-recovery'
 ) and start_time < now() - interval '7 days';
 if not force_probe and not exists (
  select 1 from public.commerce_orders where status in ('submitted','approved')
 ) then return null; end if;
 select net.http_get(
  url := (select decrypted_secret from vault.decrypted_secrets where name = 'carbase_jobs_url'),
  headers := jsonb_build_object('Authorization', 'Bearer ' || (
   select decrypted_secret from vault.decrypted_secrets where name = 'carbase_jobs_secret'
  )),
  timeout_milliseconds := 65000
 ) into request;
 insert into commerce_private.recovery_requests(request_id) values(request);
 return request;
end;
$$;
revoke all on function commerce_private.dispatch_recovery(boolean) from public, anon, authenticated;

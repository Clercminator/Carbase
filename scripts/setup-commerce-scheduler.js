import { readFileSync } from 'node:fs'
import process from 'node:process'
import pg from 'pg'
import { loadEnv } from 'vite'

const env = loadEnv('development', '.', '')
const mode = process.argv[2] || 'install'
const client = new pg.Client({ connectionString: env.SUPABASE_DATABASE_URL, ssl: { rejectUnauthorized: true, ca: readFileSync(new URL('./certs/supabase-root.crt', import.meta.url), 'utf8') }, connectionTimeoutMillis: 10000 })
try {
 if (!['install', 'check', 'probe', 'pause'].includes(mode) || !env.SUPABASE_DATABASE_URL || !env.CRON_SECRET) throw new Error('Invalid configuration')
 const url = new URL('/api/commerce?action=jobs', env.APP_URL)
 if (url.protocol !== 'https:') throw new Error('HTTPS required')
 await client.connect()
 if (mode === 'install') {
  await client.query('begin')
  await client.query('create extension if not exists pg_cron; create extension if not exists pg_net; create schema if not exists commerce_private; revoke all on schema commerce_private from public, anon, authenticated')
  for (const [name, value] of [['carbase_jobs_url', url.href], ['carbase_jobs_secret', env.CRON_SECRET]]) {
   const existing = await client.query('select id from vault.secrets where name=$1', [name])
   if (existing.rows.length) await client.query('select vault.update_secret($1,$2)', [existing.rows[0].id, value])
   else await client.query('select vault.create_secret($1,$2)', [value, name])
  }
  await client.query(readFileSync(new URL('../supabase/commerce-scheduler.sql', import.meta.url), 'utf8'))
  await client.query("select cron.schedule('carbase-commerce-recovery','*/5 * * * *','select commerce_private.dispatch_recovery()')")
  await client.query("select cron.alter_job(jobid, active := true) from cron.job where jobname='carbase-commerce-recovery'")
  await client.query('commit')
 }
 if (mode === 'pause') await client.query("select cron.alter_job(jobid, active := false) from cron.job where jobname='carbase-commerce-recovery'")
 if (mode === 'probe') {
  // Exercises the exact network path without creating an order or payment.
  const result = await client.query('select commerce_private.dispatch_recovery(true) as request_id')
  console.log(result.rows[0])
 }
 console.log(JSON.stringify({ jobs: (await client.query("select jobid,schedule,active from cron.job where jobname='carbase-commerce-recovery'")).rows, runs: (await client.query("select status,start_time,end_time from cron.job_run_details where jobid in (select jobid from cron.job where jobname='carbase-commerce-recovery') order by start_time desc limit 3")).rows, responses: (await client.query('select r.id,r.status_code,r.timed_out,r.created, case when r.status_code=200 then r.content::jsonb else null end as result from net._http_response r join commerce_private.recovery_requests q on q.request_id=r.id order by r.created desc limit 3')).rows }))
} catch (error) {
 await client.query('rollback').catch(() => {})
 console.error(`Scheduler operation failed (${error.code || 'CONFIGURATION_ERROR'}). Credentials were not printed.`)
 process.exitCode = 1
} finally { await client.end().catch(() => {}) }

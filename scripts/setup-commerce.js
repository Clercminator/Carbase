import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import process from 'node:process'
import pg from 'pg'
import { loadEnv } from 'vite'
import { createClient } from '@supabase/supabase-js'

const env=loadEnv('development','.', '')
const ca=readFileSync(new URL('./certs/supabase-root.crt',import.meta.url),'utf8')
const client=new pg.Client(env.SUPABASE_DATABASE_URL ? {connectionString:env.SUPABASE_DATABASE_URL,ssl:{rejectUnauthorized:true,ca},connectionTimeoutMillis:10000} : {host:`db.${env.SUPABASE_PROJECT_ID}.supabase.co`,port:5432,user:'postgres',password:env.SUPABASE_DATABASE_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:true,ca},connectionTimeoutMillis:10000})
try {
 await client.connect()
 await client.query('begin')
 await client.query('create table if not exists public.carbase_schema_migrations(name text primary key, checksum text not null, applied_at timestamptz not null default now())')
 await client.query('revoke all on public.carbase_schema_migrations from anon, authenticated')
 const sql=readFileSync(new URL('../supabase/migrations/202609070001_commerce.sql',import.meta.url),'utf8')
 const checksum=createHash('sha256').update(sql).digest('hex')
 const name='202609070001_commerce'
 const previous=await client.query('select checksum from public.carbase_schema_migrations where name=$1',[name])
 if(previous.rows.length && previous.rows[0].checksum!==checksum) throw Object.assign(new Error(),{code:'MIGRATION_CHECKSUM_CHANGED'})
 if(!previous.rows.length){await client.query(sql);await client.query('insert into public.carbase_schema_migrations(name,checksum) values($1,$2)',[name,checksum])}
 await client.query("notify pgrst, 'reload schema'")
 await client.query('commit')
 const db=createClient(env.SUPABASE_URL||`https://${env.SUPABASE_PROJECT_ID}.supabase.co`,env.SUPABASE_SECRET_KEY,{auth:{persistSession:false}})
 const existing=await db.storage.getBucket('paid-reports')
 if(existing.data?.public) throw Object.assign(new Error(),{code:'REPORT_BUCKET_MUST_BE_PRIVATE'})
 if(!existing.data){const result=await db.storage.createBucket('paid-reports',{public:false,fileSizeLimit:8*1024*1024,allowedMimeTypes:['application/pdf']});if(result.error)throw Object.assign(new Error(),{code:'BUCKET_SETUP_FAILED'})}
 console.log('Commerce migration and private report bucket verified.')
} catch(error) {
 await client.query('rollback').catch(()=>{})
 console.error(`Commerce setup failed (${error.code || 'CONNECTION_OR_CONFIGURATION_ERROR'}). No credentials or connection strings were printed.`)
 process.exitCode=1
} finally {await client.end().catch(()=>{})}

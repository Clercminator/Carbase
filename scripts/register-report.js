import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import process from 'node:process'
import { loadEnv } from 'vite'
import { createClient } from '@supabase/supabase-js'

// Trusted operator/pipeline only. Never publish demo or unlicensed report data.
const [path,title]=process.argv.slice(2)
if(!path||!title||!process.argv.includes('--verified')){
 console.error('Usage: node scripts/register-report.js <PDF path> <title> --verified (real, reviewed report only)')
 process.exit(1)
}
const env=loadEnv('development','.', '')
const bytes=readFileSync(path)
if(bytes.length>8*1024*1024||bytes.subarray(0,5).toString()!=='%PDF-')throw new Error('Expected a PDF up to 8 MB.')
const db=createClient(env.SUPABASE_URL||`https://${env.SUPABASE_PROJECT_ID}.supabase.co`,env.SUPABASE_SECRET_KEY,{auth:{persistSession:false}})
const id=randomUUID(),storagePath=`${id}.pdf`
const uploaded=await db.storage.from('paid-reports').upload(storagePath,bytes,{contentType:'application/pdf',upsert:false})
if(uploaded.error){console.error('Private report upload failed.');process.exit(1)}
const result=await db.from('commerce_reports').insert({id,title,storage_path:storagePath,ready:true,available_until:new Date(Date.now()+24*3600000).toISOString()})
if(result.error){console.error('Report registration failed; inspect the unregistered storage object before retrying.');process.exit(1)}
console.log(`${env.APP_URL}/checkout?plan=report&report=${id}`)
console.log(`${env.APP_URL}/checkout?plan=pack&report=${id}`)

import { loadEnv } from 'vite'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import process from 'node:process'
const env=loadEnv('development','.', '')
const required=['SUPABASE_SECRET_KEY','MERCADOPAGO_PUBLIC_KEY','MERCADOPAGO_ACCESS_TOKEN','MERCADOPAGO_WEBHOOK_SECRET','MERCADOPAGO_COLLECTOR_ID','ORDER_ACCESS_SECRET','CRON_SECRET','SMTP_USER','SMTP_PASS','EMAIL_FROM','APP_URL']
console.log(JSON.stringify({paymentsEnabled:env.COMMERCE_ENABLED==='true',missingVariables:required.filter(k=>!env[k])}))
const db=createClient(env.SUPABASE_URL||`https://${env.SUPABASE_PROJECT_ID}.supabase.co`,env.SUPABASE_SECRET_KEY,{auth:{persistSession:false}})
for(const table of ['commerce_orders','commerce_reports','commerce_redemptions']){
 const {error,status}=await db.from(table).select('*').limit(0)
 console.log(`${table}: ${error||status>=400?'not available':'available'}`)
 if(error||status>=400)process.exitCode=1
}
if(env.SMTP_USER&&env.SMTP_PASS){
 try{
  const transport=nodemailer.createTransport({host:'smtp.gmail.com',port:465,secure:true,auth:{user:env.SMTP_USER,pass:env.SMTP_PASS},connectionTimeout:10000,socketTimeout:10000})
  await transport.verify();console.log('SMTP authentication verified; no email sent.')
 }catch{console.log('SMTP authentication failed; no credential details printed.');process.exitCode=1}
}

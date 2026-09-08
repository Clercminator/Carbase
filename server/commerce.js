import { APP_NAME, APP_SLUG } from '../src/config/brand.js'
import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'
import process from 'node:process'
import { catalog, fail, guestToken, ownsOrder, readiness, uuid, validatePayment, verifyWebhook, equal } from './commerce-core.js'
import { subscriptionsEnabled, subscriptionAction, syncSubscription, syncInvoice, subscriptionApi, subscriptionPayment, runSubscriptionJobs } from './subscriptions.js'

const safeOrder = o => ({ id:o.id, planId:o.plan_id, amount:o.amount, status:o.status, createdAt:o.created_at, expiresAt:o.expires_at, credits:o.credits })
const check = result => { if (result.error) fail(503, 'No pudimos acceder a tus compras. Intenta nuevamente.'); return result.data }
async function mp(env, path, options = {}) {
 const response = await fetch(`https://api.mercadopago.com${path}`, { ...options, headers: { Authorization:`Bearer ${env.MERCADOPAGO_ACCESS_TOKEN}`, 'Content-Type':'application/json', ...options.headers }, signal:AbortSignal.timeout(15000) })
 if (!response.ok) fail(502, 'No pudimos confirmar el pago. Revisa el estado antes de intentar otra compra.')
 return response.json()
}
async function getUser(req, db) {
 const header = req.headers.authorization
 if (!header) return null
 if (!header.startsWith('Bearer ')) fail(401,'Inicia sesión nuevamente.')
 const { data, error } = await db.auth.getUser(header.slice(7))
 if (error || !data.user) fail(401,'Inicia sesión nuevamente.')
 return data.user
}
async function orderFor(db, id) {
 if (!uuid(id)) fail(404,'Compra no encontrada.')
 const result = await db.from('commerce_orders').select('*').eq('id',id).maybeSingle()
 const order = check(result)
 if (!order) fail(404,'Compra no encontrada.')
 return order
}
async function reportFor(db, id, requireAvailable = true) {
 if (!uuid(id)) fail(400,'Selecciona un informe disponible.')
 const report = check(await db.from('commerce_reports').select('*').eq('id',id).maybeSingle())
 if (!report || !report.ready || (requireAvailable && Date.parse(report.available_until)<=Date.now())) fail(409,'Este informe aún no está disponible para compra.')
 return report
}
async function pdfFor(db, report) {
 const file = check(await db.storage.from('paid-reports').download(report.storage_path))
 if (file.size > 8*1024*1024) fail(503,'El informe requiere revisión antes de su entrega.')
 const bytes = new Uint8Array(await file.arrayBuffer())
 if (new TextDecoder().decode(bytes.slice(0,5)) !== '%PDF-') fail(503,'El informe requiere revisión antes de su entrega.')
 return bytes
}
async function reconcile(db, env, payment) {
 let order
 try { order = await orderFor(db,payment.external_reference) }
 catch(error) { if(error.status!==404) throw error; return subscriptionPayment(db,env,payment) }
 if(order.subscription_id) return subscriptionPayment(db,env,payment)
 const status = validatePayment(payment,order,env.MERCADOPAGO_COLLECTOR_ID)
 check(await db.rpc('commerce_apply_payment',{ p_order:order.id,p_payment:String(payment.id),p_status:status,p_updated:payment.date_last_updated }))
 return order.id
}
async function details(db, order) {
 const uses = check(await db.from('commerce_redemptions').select('report_id,email_sent_at,commerce_reports(title)').eq('order_id',order.id))
 return { ...safeOrder(order), creditsRemaining: order.status === 'approved' && Date.parse(order.expires_at)>Date.now() && (!order.cycle_start || Date.parse(order.cycle_start)<=Date.now()) ? Math.max(0,order.credits-uses.length) : 0, reports: uses.map(r=>({ id:r.report_id,title:r.commerce_reports.title, deliveryStatus:r.email_sent_at?'sent':'pending' })) }
}

export function createHandler(env = process.env, suppliedDb) {
 return async function handler(req,res) {
  res.setHeader('Cache-Control','no-store')
  res.setHeader('Referrer-Policy','no-referrer')
  try {
   const url = new URL(req.url,'https://local.invalid')
   const action = req.commerceAction || url.searchParams.get('action') || 'config'
   const methods = { config:'GET', report:'GET', create:'POST', pay:'POST', order:'GET', history:'GET', claim:'POST', redeem:'POST', download:'GET', webhook:'POST', jobs:'GET', subscriptions:'GET', subscribe:'POST', cancelSubscription:'POST', subscriptionJobs:'GET' }
   if (!(action in methods)) fail(404,'Ruta no encontrada.')
   if (req.method !== methods[action]) { res.setHeader('Allow',methods[action]); fail(405,'Método no permitido.') }
   if (action === 'config') return res.status(200).json({ enabled:readiness(env), subscriptionsEnabled:subscriptionsEnabled(env), publicKey:readiness(env)?env.MERCADOPAGO_PUBLIC_KEY:null })
   if (req.method === 'POST' && action !== 'webhook' && req.headers.origin && req.headers.origin !== new URL(env.APP_URL || 'http://localhost:5173').origin) fail(403,'Origen no permitido.')
   const db = suppliedDb || createClient(env.SUPABASE_URL || `https://${env.SUPABASE_PROJECT_ID}.supabase.co`,env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}})
   const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
   if (action === 'webhook') {
    const id = url.searchParams.get('data.id')
    if (!verifyWebhook({id,requestId:req.headers['x-request-id'],signature:req.headers['x-signature']},env.MERCADOPAGO_WEBHOOK_SECRET)) fail(401,'Notificación inválida.')
    if (String(body.data?.id) !== id) fail(400,'Evento no compatible.')
    if (body.type==='subscription_preapproval') {
     await syncSubscription(db,env,await subscriptionApi(env,`/preapproval/${encodeURIComponent(id)}`))
     return res.status(200).json({received:true})
    }
    if (body.type==='subscription_authorized_payment') {
     await syncInvoice(db,env,await subscriptionApi(env,`/authorized_payments/${encodeURIComponent(id)}`))
     return res.status(200).json({received:true})
    }
    if (body.type==='subscription_preapproval_plan') return res.status(200).json({received:true,ignored:true})
    if (body.type !== 'payment' || !/^\d+$/.test(id)) fail(400,'Evento no compatible.')
    const orderId = await reconcile(db,env,await mp(env,`/v1/payments/${id}`))
    const delivery = orderId ? await runJobs(db,env,{orderId}) : {failed:0}
    if (delivery.failed) fail(503,'Entrega pendiente de reintento.')
    return res.status(200).json({received:true})
   }
   if (action === 'jobs' || action === 'subscriptionJobs') {
    if (!env.CRON_SECRET || !equal(req.headers.authorization,`Bearer ${env.CRON_SECRET}`)) fail(401,'Acceso denegado.')
    return res.status(200).json(await (action==='jobs'?runJobs(db,env):runSubscriptionJobs(db,env)))
   }
   const user = await getUser(req,db)
   if (['subscriptions','subscribe','cancelSubscription'].includes(action)) return res.status(200).json(await subscriptionAction(action,{db,env,user,body}))
   if (action === 'history' || action === 'claim') {
    if (!user) fail(401,'Inicia sesión para ver tus compras.')
    if (action === 'claim') {
     if (!user.email_confirmed_at || !user.email) fail(403,'Confirma tu correo antes de vincular compras.')
     // Email is derived only from a server-verified Supabase identity.
     const claimed = check(await db.from('commerce_orders').update({user_id:user.id}).is('user_id',null).eq('email',user.email.trim().toLowerCase()).select('id'))
     return res.status(200).json({claimed:claimed.length})
    }
    const orders = check(await db.from('commerce_orders').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).limit(100))
    return res.status(200).json({orders:await Promise.all(orders.map(o=>details(db,o)))})
   }
   if (action === 'report') {
    const report = await reportFor(db,url.searchParams.get('id'))
    return res.status(200).json({id:report.id,title:report.title})
   }
   if (action === 'create') {
    if (!readiness(env)) fail(503,'Las compras aún no están disponibles. No se ha realizado ningún cobro.')
    const plan = Object.hasOwn(catalog,body.planId) ? catalog[body.planId] : null
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (!plan || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length>254) fail(400,'Revisa el plan y el correo de entrega.')
    const ip = req.headers['x-vercel-forwarded-for'] || req.socket?.remoteAddress || 'local'
    const key = createHash('sha256').update(String(ip)).digest('hex')
    if (!check(await db.rpc('commerce_rate_limit',{p_key:key,p_limit:10}))) fail(429,'Demasiados intentos. Espera unos minutos.')
    const report = await reportFor(db,body.reportId)
    // Delivery is precomputed by a trusted data pipeline, never synthesized from browser input.
    await pdfFor(db,report)
    const order = check(await db.from('commerce_orders').insert({email,user_id:user?.id || null,plan_id:body.planId,amount:plan.amount,credits:plan.credits,initial_report_id:report.id}).select('*').single())
    return res.status(201).json({order:await details(db,order),token:guestToken(order,env.ORDER_ACCESS_SECRET)})
   }
   const id = body.orderId || url.searchParams.get('id')
   const order = await orderFor(db,id)
   if (!ownsOrder(order,user,req.headers['x-order-token'],env.ORDER_ACCESS_SECRET)) fail(404,'Compra no encontrada o enlace vencido. Inicia sesión si vinculaste la compra a tu cuenta.')
   if (action === 'order') return res.status(200).json({order:await details(db,order)})
   if (action === 'pay') {
    if (order.plan_id==='pro') fail(409,'Las cuotas mensuales se procesan automáticamente.')
    if (!readiness(env)) fail(503,'Los pagos no están disponibles.')
    if (order.status !== 'pending' || Date.now()-Date.parse(order.created_at)>30*60000) fail(409,'La compra ya fue enviada o venció. Consulta su estado.')
    await pdfFor(db,await reportFor(db,order.initial_report_id))
    const f = body.formData
    if (!f || typeof f.token !== 'string' || !/^[a-zA-Z0-9_-]{10,200}$/.test(f.token) || typeof f.payment_method_id !== 'string' || f.payment_method_id.length>50 || f.installments !== 1) fail(400,'Revisa los datos de pago. Selecciona una cuota.')
    const reserved = check(await db.from('commerce_orders').update({status:'submitted'}).eq('id',order.id).eq('status','pending').select('id'))
    if (!reserved.length) fail(409,'Ya estamos verificando este pago.')
    const payment = await mp(env,'/v1/payments',{method:'POST',headers:{'X-Idempotency-Key':order.id},body:JSON.stringify({transaction_amount:order.amount,description:(order.plan_id==='pro'?'Profesional · cuota mensual':catalog[order.plan_id].name),token:f.token,installments:1,payment_method_id:f.payment_method_id,issuer_id:f.issuer_id,external_reference:order.id,notification_url:`${new URL(env.APP_URL).origin}/api/webhooks/mercadopago`,payer:{email:order.email,identification:f.payer?.identification}})})
    await reconcile(db,env,payment)
    return res.status(200).json({order:await details(db,await orderFor(db,order.id))})
   }
   if (action === 'redeem') {
    await pdfFor(db,await reportFor(db,body.reportId))
    const result = await db.rpc('commerce_redeem',{p_order:order.id,p_report:body.reportId})
    if (result.error) fail(409,'No se pudo usar el crédito. Revisa el saldo, la vigencia y la disponibilidad del informe.')
    return res.status(200).json({order:await details(db,await orderFor(db,order.id))})
   }
   if (action === 'download') {
    if (order.status !== 'approved') fail(403,'La compra no tiene un pago aprobado.')
    const reportId = url.searchParams.get('report')
    if (!uuid(reportId)) fail(404,'Informe no encontrado.')
    const redemption = check(await db.from('commerce_redemptions').select('report_id').eq('order_id',order.id).eq('report_id',reportId).maybeSingle())
    if (!redemption) fail(404,'Informe no encontrado.')
    const bytes = await pdfFor(db,await reportFor(db,reportId,false))
    res.setHeader('Content-Type','application/pdf')
    res.setHeader('Content-Disposition',`attachment; filename="informe-${APP_SLUG}.pdf"`)
    return res.status(200).send(Buffer.from(bytes))
   }
  } catch(error) {
   // Never return raw database/provider errors or log payment payloads.
   return res.status(error.status || 503).json({error:error.status?error.message:'El servicio no está disponible. Intenta nuevamente.'})
  }
 }
}

export async function runJobs(db,env,{orderId} = {}) {
 let reconciled=0, sent=0, failed=0
 const pending = orderId ? [] : check(await db.from('commerce_orders').select('*').is('subscription_id',null).in('status',['submitted','approved']).order('payment_checked_at',{ascending:true,nullsFirst:true}).limit(1))
 for (const order of pending) {
  try {
   check(await db.from('commerce_orders').update({payment_checked_at:new Date().toISOString()}).eq('id',order.id))
   const payments = order.payment_id ? [await mp(env,`/v1/payments/${order.payment_id}`)] : (await mp(env,`/v1/payments/search?external_reference=${encodeURIComponent(order.id)}&sort=date_created&criteria=desc`)).results
   if (payments?.length===1) { await reconcile(db,env,payments[0]); reconciled++ }
  } catch { failed++ }
 }
 let query = db.from('commerce_redemptions').select('*,commerce_orders!inner(status)').eq('commerce_orders.status','approved').is('email_sent_at',null).or(`email_claimed_at.is.null,email_claimed_at.lt.${new Date(Date.now()-10*60000).toISOString()}`).order('created_at').limit(2)
 if (orderId) query=query.eq('order_id',orderId)
 const jobs = check(await query)
 for (const job of jobs) {
  let acquired=false
  const lease=new Date().toISOString()
  try {
   const order=await orderFor(db,job.order_id)
   if (order.status!=='approved') continue
   if (!env.SMTP_USER || !env.SMTP_PASS || !env.EMAIL_FROM || !env.ORDER_ACCESS_SECRET) continue
   const claimed=check(await db.from('commerce_redemptions').update({email_claimed_at:lease}).eq('order_id',job.order_id).eq('report_id',job.report_id).is('email_sent_at',null).or(`email_claimed_at.is.null,email_claimed_at.lt.${new Date(Date.now()-10*60000).toISOString()}`).select('*'))
   if (!claimed.length) continue
   acquired=true
   const report=await reportFor(db,job.report_id,false)
   const bytes=await pdfFor(db,report)
   const link=`${new URL(env.APP_URL).origin}/purchase/${order.id}#${guestToken(order,env.ORDER_ACCESS_SECRET)}`
   // A stable Message-ID helps tracing. SMTP has no exactly-once delivery guarantee.
   const transport=nodemailer.createTransport({host:'smtp.gmail.com',port:465,secure:true,auth:{user:env.SMTP_USER,pass:env.SMTP_PASS},connectionTimeout:10000,socketTimeout:15000,disableFileAccess:true,disableUrlAccess:true})
   await transport.sendMail({from:{name:APP_NAME,address:env.EMAIL_FROM.match(/<([^>]+)>/)?.[1] || env.EMAIL_FROM},to:order.email,messageId:`<${order.id}.${report.id}@${env.SMTP_USER.split('@')[1]}>`,subject:"Tu informe " + APP_NAME,text:`Tu informe está adjunto. Compra: ${(order.plan_id==='pro'?'Profesional · cuota mensual':catalog[order.plan_id].name)}. Total pagado: $${order.amount.toLocaleString('es-CL')} CLP, IVA incluido.\nGestiona tu compra y los créditos restantes: ${link}\nSi vinculaste la compra a una cuenta, inicia sesión para verla.`,attachments:[{filename:`informe-${APP_SLUG}.pdf`,content:Buffer.from(bytes),contentType:'application/pdf'}]})
   check(await db.from('commerce_redemptions').update({email_sent_at:new Date().toISOString()}).eq('order_id',job.order_id).eq('report_id',job.report_id))
   sent++
  } catch {
   failed++
   if (acquired) await db.from('commerce_redemptions').update({email_claimed_at:null}).eq('order_id',job.order_id).eq('report_id',job.report_id).eq('email_claimed_at',lease).is('email_sent_at',null)
  }
 }
 return {reconciled,sent,failed}
}

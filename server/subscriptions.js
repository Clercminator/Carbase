import { APP_NAME } from '../src/config/brand.js'
import { fail, readiness, uuid, validatePayment } from './commerce-core.js'

export const professional = Object.freeze({ amount: 29990, credits: 30 })
export const subscriptionsEnabled = env => readiness(env) && env.SUBSCRIPTIONS_ENABLED === 'true'
const checked = r => { if (r.error) fail(503,'No pudimos consultar tu suscripción.'); return r.data }
const providerId = id => typeof id === 'string' && /^[a-zA-Z0-9_-]{1,128}$/.test(id)
export async function subscriptionApi(env,path,options={}) {
 const r=await fetch(`https://api.mercadopago.com${path}`,{...options,headers:{Authorization:`Bearer ${env.MERCADOPAGO_ACCESS_TOKEN}`,'Content-Type':'application/json'},signal:AbortSignal.timeout(8000)})
 if (!r.ok) fail(502,'No pudimos confirmar la suscripción. Consulta su estado antes de volver a intentar.')
 return r.json()
}
export function validateSubscription(remote,local,env) {
 const a=remote.auto_recurring
 if (!providerId(remote.id) || (local.provider_id && remote.id!==local.provider_id) || remote.external_reference!==local.id || String(remote.collector_id)!==String(env.MERCADOPAGO_COLLECTOR_ID) || Number(a?.transaction_amount)!==local.amount || a?.currency_id!=='CLP' || a.frequency!==1 || a.frequency_type!=='months' || a.free_trial || !['pending','authorized','paused','cancelled'].includes(remote.status) || !Number.isFinite(Date.parse(remote.last_modified))) fail(409,'La suscripción no coincide con el plan contratado.')
}
export async function syncSubscription(db,env,remote) {
 if (!uuid(remote.external_reference)) fail(409,'Suscripción no reconocida.')
 const local=checked(await db.from('commerce_subscriptions').select('*').eq('id',remote.external_reference).maybeSingle())
 if (!local) fail(404,'Suscripción no encontrada.')
 validateSubscription(remote,local,env)
 checked(await db.rpc('commerce_sync_subscription',{p_id:local.id,p_provider:remote.id,p_status:remote.status,p_updated:remote.last_modified,p_next:remote.next_payment_date || null}))
 return {...local,provider_id:remote.id}
}
export async function syncInvoice(db,env,invoice) {
 if (!providerId(invoice.preapproval_id) || !/^\d+$/.test(String(invoice.id)) || !Number.isFinite(Date.parse(invoice.debit_date))) fail(409,'Cuota no reconocida.')
 const remote=await subscriptionApi(env,`/preapproval/${invoice.preapproval_id}`)
 const sub=await syncSubscription(db,env,remote)
 if (String(invoice.external_reference)!==sub.id || invoice.currency_id!=='CLP' || Number(invoice.transaction_amount)!==sub.amount || invoice.preapproval_id!==sub.provider_id) fail(409,'La cuota no coincide con tu plan.')
 if (!invoice.payment?.id) return null // Scheduled or retried invoices grant no credits.
 if (!/^\d+$/.test(String(invoice.payment.id))) fail(409,'Pago no reconocido.')
 const payment=await subscriptionApi(env,`/v1/payments/${invoice.payment.id}`)
 if (String(payment.id)!==String(invoice.payment.id)) fail(409,'Pago no reconocido.')
 const status=validatePayment(payment,{id:sub.id,amount:sub.amount},env.MERCADOPAGO_COLLECTOR_ID)
 return checked(await db.rpc('commerce_apply_invoice',{p_subscription:sub.id,p_invoice:String(invoice.id),p_payment:String(payment.id),p_status:status,p_updated:payment.date_last_updated,p_start:invoice.debit_date}))
}
export async function subscriptionPayment(db,env,payment) {
 const invoices=await subscriptionApi(env,`/authorized_payments/search?payment_id=${encodeURIComponent(payment.id)}`)
 if (invoices.results?.length!==1 || String(invoices.results[0].payment?.id)!==String(payment.id)) fail(409,'Cuota pendiente de conciliación.')
 return syncInvoice(db,env,invoices.results[0])
}
const safe = s => ({id:s.id,status:s.status,amount:s.amount,nextPaymentAt:s.next_payment_at,cancelRequested:s.cancel_requested,createdAt:s.created_at})

export async function subscriptionAction(action,{db,env,user,body}) {
 if (!user?.id || !user.email_confirmed_at || !user.email) fail(401,'Inicia sesión con un correo confirmado para gestionar tu plan.')
 if (action==='subscriptions') return {subscriptions:checked(await db.from('commerce_subscriptions').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).limit(20)).map(safe)}
 if (action==='subscribe') {
  if (!subscriptionsEnabled(env)) fail(503,'El plan mensual aún no está disponible. No se ha realizado ningún cobro.')
  if (body.acceptRecurring!==true || !/^[a-zA-Z0-9_-]{10,200}$/.test(body.cardToken || '')) fail(400,'Confirma la renovación mensual y revisa la tarjeta.')
  if (!checked(await db.rpc('commerce_rate_limit',{p_key:`subscription:${user.id}`,p_limit:5}))) fail(429,'Espera unos minutos antes de intentar nuevamente.')
  // A unique active-user constraint wins races across tabs. Persist before contacting MP.
  const inserted=await db.from('commerce_subscriptions').insert({user_id:user.id,email:user.email.trim().toLowerCase(),amount:professional.amount}).select('*').single()
  if (inserted.error?.code==='23505') fail(409,'Ya tienes una suscripción activa o en verificación. Revisa Mi cuenta.')
  const local=checked(inserted)
  // Never blindly repeat this POST after a timeout. The worker searches the persisted reference.
  const remote=await subscriptionApi(env,'/preapproval',{method:'POST',body:JSON.stringify({external_reference:local.id,reason:`${APP_NAME} Profesional`,payer_email:local.email,card_token_id:body.cardToken,status:'authorized',back_url:`${new URL(env.APP_URL).origin}/account`,auto_recurring:{frequency:1,frequency_type:'months',transaction_amount:local.amount,currency_id:'CLP'}})})
  await syncSubscription(db,env,remote)
  return {submitted:true}
 }
 if (!uuid(body.subscriptionId)) fail(404,'Suscripción no encontrada.')
 const sub=checked(await db.from('commerce_subscriptions').select('*').eq('id',body.subscriptionId).eq('user_id',user.id).maybeSingle())
 if (!sub) fail(404,'Suscripción no encontrada.')
 if (sub.status==='cancelled') return {cancelled:true}
 checked(await db.from('commerce_subscriptions').update({cancel_requested:true}).eq('id',sub.id))
 if (!sub.provider_id) return {pending:true}
 await cancelSubscription(db,env,sub)
 return {cancelled:true}
}
async function cancelSubscription(db,env,sub) {
 const remote=await subscriptionApi(env,`/preapproval/${sub.provider_id}`,{method:'PUT',body:JSON.stringify({status:'cancelled'})})
 await syncSubscription(db,env,remote)
 if (remote.status!=='cancelled') fail(502,'La cancelación sigue pendiente de confirmación.')
 // Paid order expiry and historical PDF access remain unchanged.
}

export async function runSubscriptionJobs(db,env) {
 let reconciled=0,failed=0
 const rows=checked(await db.from('commerce_subscriptions').select('*').order('checked_at',{ascending:true,nullsFirst:true}).limit(1))
 for (let sub of rows) {
  try {
   checked(await db.from('commerce_subscriptions').update({checked_at:new Date().toISOString()}).eq('id',sub.id))
   if (!sub.provider_id) {
    const matches=await subscriptionApi(env,`/preapproval/search?payer_email=${encodeURIComponent(sub.email)}&q=${sub.id}&limit=100`)
    const exact=matches.results?.filter(s=>s.external_reference===sub.id)
    if (exact?.length!==1 || Number(matches.paging?.total)>100) fail(409,'Suscripción pendiente de revisión.')
    sub=await syncSubscription(db,env,exact[0])
   }
   if (sub.cancel_requested && sub.status!=='cancelled') {await cancelSubscription(db,env,sub);reconciled++;continue}
   const page=await subscriptionApi(env,`/authorized_payments/search?preapproval_id=${sub.provider_id}&offset=${sub.invoice_offset}&limit=1`)
   if (!Array.isArray(page.results)) fail(502,'Respuesta incompleta.')
   if (page.results.length) {await syncInvoice(db,env,page.results[0]);reconciled++}
   else await syncSubscription(db,env,await subscriptionApi(env,`/preapproval/${sub.provider_id}`))
   const offset=sub.invoice_offset+page.results.length
   checked(await db.from('commerce_subscriptions').update({invoice_offset:offset>=Number(page.paging?.total || 0)?0:offset}).eq('id',sub.id))
  } catch {failed++}
 }
 return {reconciled,failed}
}

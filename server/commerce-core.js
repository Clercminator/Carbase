import { Buffer } from 'node:buffer'
import { createHmac, timingSafeEqual } from 'node:crypto'

export const catalog = Object.freeze({
 report: { name: 'Informe individual', amount: 4990, credits: 1 },
 pack: { name: 'Compara 3', amount: 11990, credits: 3 },
})
export const uuid = value => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
export function fail(status, message) { throw Object.assign(new Error(message), { status }) }
export function equal(a, b) {
 return typeof a === 'string' && typeof b === 'string' && Buffer.byteLength(a) === Buffer.byteLength(b) && timingSafeEqual(Buffer.from(a), Buffer.from(b))
}
export function guestToken(order, secret) {
 return createHmac('sha256', secret).update(`purchase:${order.id}:${order.created_at}`).digest('hex')
}
export function ownsOrder(order, user, token, secret) {
 if (user?.id && order.user_id === user.id) return true
 return Boolean(secret && !order.user_id && Date.now() - Date.parse(order.created_at) < 90*86400000 && equal(token, guestToken(order, secret)))
}
export function verifyWebhook({ id, requestId, signature }, secret) {
 if (!secret || !/^[a-zA-Z0-9_-]{1,128}$/.test(id || '') || !requestId || typeof signature !== 'string') return false
 const fields = Object.fromEntries(signature.split(',').map(s => s.trim().split('=')))
 if (!/^\d+$/.test(fields.ts || '') || !/^[a-f0-9]{64}$/i.test(fields.v1 || '')) return false
 const expected = createHmac('sha256', secret).update(`id:${id.toLowerCase()};request-id:${requestId};ts:${fields.ts};`).digest('hex')
 return equal(expected, fields.v1.toLowerCase())
}
export function validatePayment(payment, order, merchantId) {
 if (String(payment.collector_id) !== String(merchantId) || payment.external_reference !== order.id || payment.currency_id !== 'CLP' || Number(payment.transaction_amount) !== order.amount) fail(409, 'El pago no coincide con la compra.')
 if (!Number.isFinite(Date.parse(payment.date_last_updated))) fail(502, 'Respuesta de pago incompleta.')
 const states = ['approved','rejected','cancelled','refunded','charged_back']
 // Any partial refund revokes fulfillment until manually reconciled.
 return Number(payment.transaction_amount_refunded) > 0 ? 'refunded' : states.includes(payment.status) ? payment.status : 'submitted'
}
export function readiness(env) {
 return env.COMMERCE_ENABLED === 'true' && ['MERCADOPAGO_ACCESS_TOKEN','MERCADOPAGO_PUBLIC_KEY','MERCADOPAGO_WEBHOOK_SECRET','MERCADOPAGO_COLLECTOR_ID','ORDER_ACCESS_SECRET','SMTP_USER','SMTP_PASS','EMAIL_FROM','APP_URL','SUPABASE_SECRET_KEY'].every(key => Boolean(env[key]))
}

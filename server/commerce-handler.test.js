import { describe, expect, it, vi, afterEach } from 'vitest'
import { createHandler } from './commerce.js'
import { guestToken } from './commerce-core.js'

const id='11111111-1111-4111-8111-111111111111'
const report='21111111-1111-4111-8111-111111111111'
const order={id,email:'guest@example.test',user_id:null,created_at:new Date().toISOString(),plan_id:'report',amount:4990,credits:1,status:'pending',initial_report_id:report}
const env={APP_URL:'http://localhost:5173',ORDER_ACCESS_SECRET:'test-order-secret',MERCADOPAGO_COLLECTOR_ID:'123'}
function chain(data){
 const builder={then:(resolve)=>Promise.resolve({data,error:null}).then(resolve)}
 for(const name of ['select','eq','is','order','limit','maybeSingle','single','update','insert','or'])builder[name]=vi.fn(()=>builder)
 return builder
}
function response(){return {setHeader:vi.fn(),status:vi.fn(function(code){this.code=code;return this}),json:vi.fn(function(data){this.data=data;return this}),send:vi.fn()}}
async function run(action,{user=null,token,body={},orders=order,headers={},method='GET'}={}){
 const builder=chain(orders)
 const db={from:vi.fn(()=>builder),auth:{getUser:vi.fn(async()=>({data:{user},error:user?null:{}}))}}
 const res=response()
 await createHandler(env,db)({method,url:`/api/commerce?action=${action}&id=${id}`,headers:{...(token?{'x-order-token':token}:{}),...headers},body},res)
 return {res,db,builder}
}
afterEach(()=>vi.unstubAllGlobals())
describe('commerce HTTP authorization',()=>{
 it('keeps payment creation disabled before fulfillment is configured',async()=>{const {res,db}=await run('create',{method:'POST'});expect(res.code).toBe(503);expect(db.from).not.toHaveBeenCalled()})
 it('requires verified identity for purchase history',async()=>{const {res}=await run('history');expect(res.code).toBe(401)})
 it('does not expose orders by guessing UUIDs',async()=>{const {res}=await run('order');expect(res.code).toBe(404);expect(JSON.stringify(res.data)).not.toContain(order.email)})
 it('denies downloads before payment despite a valid guest link',async()=>{const {res}=await run('download',{token:guestToken(order,env.ORDER_ACCESS_SECRET)});expect(res.code).toBe(403)})
 it('rejects an unverified account claiming guest purchases',async()=>{const {res,db}=await run('claim',{method:'POST',user:{id:'buyer',email:order.email},headers:{authorization:'Bearer valid'}});expect(res.code).toBe(403);expect(db.from).not.toHaveBeenCalled()})
 it('claims only the server-verified email, ignoring client email input',async()=>{
  const {res,builder}=await run('claim',{method:'POST',orders:[],user:{id:'buyer',email:'Owner@Example.test',email_confirmed_at:'2026-09-07'},headers:{authorization:'Bearer valid'},body:{email:'victim@example.test'}})
  expect(res.code).toBe(200);expect(builder.eq).toHaveBeenCalledWith('email','owner@example.test');expect(builder.is).toHaveBeenCalledWith('user_id',null)
 })
 it('rejects forged notifications without contacting Mercado Pago',async()=>{const fetch=vi.fn();vi.stubGlobal('fetch',fetch);const {res}=await run('webhook',{method:'POST'});expect(res.code).toBe(401);expect(fetch).not.toHaveBeenCalled()})
 it('rejects browser cross-origin writes',async()=>{const {res}=await run('claim',{method:'POST',headers:{origin:'https://evil.test'}});expect(res.code).toBe(403)})
 it('does not expose configuration secrets',async()=>{const {res}=await run('config');expect(res.data).toEqual({enabled:false,publicKey:null})})
})

describe('payment submission',()=>{
 const enabled={...env,COMMERCE_ENABLED:'true',MERCADOPAGO_ACCESS_TOKEN:'test',MERCADOPAGO_PUBLIC_KEY:'test',MERCADOPAGO_WEBHOOK_SECRET:'test',SMTP_USER:'test@example.test',SMTP_PASS:'test',EMAIL_FROM:'test@example.test',SUPABASE_SECRET_KEY:'test'}
 it('charges the database amount, not an amount supplied by the browser',async()=>{
  const approved={...order,status:'approved',expires_at:'2099-01-01'}
  const builders=[chain(order),chain({id:report,ready:true,available_until:'2099-01-01',storage_path:'test.pdf'}),chain([{id}]),chain(order),chain(approved),chain([])]
  const db={from:vi.fn(()=>builders.shift()),rpc:vi.fn(async()=>({data:null,error:null})),storage:{from:()=>({download:async()=>({data:new Blob(['%PDF-1.4 test']),error:null})})}}
  const fetch=vi.fn(async()=>({ok:true,json:async()=>({id:123,collector_id:123,external_reference:id,currency_id:'CLP',transaction_amount:4990,status:'approved',date_last_updated:new Date().toISOString()})}))
  vi.stubGlobal('fetch',fetch)
  const res=response()
  await createHandler(enabled,db)({method:'POST',url:'/api/commerce?action=pay',headers:{'x-order-token':guestToken(order,env.ORDER_ACCESS_SECRET)},body:{orderId:id,amount:1,formData:{token:'test-token-123',payment_method_id:'visa',installments:1,transaction_amount:1}}},res)
  expect(res.code).toBe(200)
  const request=fetch.mock.calls[0][1]
  expect(JSON.parse(request.body).transaction_amount).toBe(4990)
  expect(request.headers['X-Idempotency-Key']).toBe(id)
  expect(db.rpc).toHaveBeenCalledWith('commerce_apply_payment',expect.objectContaining({p_order:id,p_payment:'123',p_status:'approved'}))
 })
 it('never resubmits an uncertain payment',async()=>{
  const uncertain={...order,status:'submitted'}
  const db={from:()=>chain(uncertain)}
  const fetch=vi.fn();vi.stubGlobal('fetch',fetch)
  const res=response()
  await createHandler(enabled,db)({method:'POST',url:'/api/commerce?action=pay',headers:{'x-order-token':guestToken(uncertain,env.ORDER_ACCESS_SECRET)},body:{orderId:id}},res)
  expect(res.code).toBe(409);expect(fetch).not.toHaveBeenCalled()
 })
})

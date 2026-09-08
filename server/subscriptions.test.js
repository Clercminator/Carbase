import { afterAll, beforeAll, describe, expect, it, vi, afterEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { createHmac } from 'node:crypto'
import { PGlite } from '@electric-sql/pglite'
import { subscriptionAction, validateSubscription, syncInvoice } from './subscriptions.js'
import { verifyWebhook } from './commerce-core.js'

const sid='61111111-1111-4111-8111-111111111111'
const uid='71111111-1111-4111-8111-111111111111'
const remote={id:'abc123',external_reference:sid,collector_id:123,status:'authorized',last_modified:'2026-09-08T00:00:00Z',auto_recurring:{frequency:1,frequency_type:'months',transaction_amount:29990,currency_id:'CLP'}}
const env={MERCADOPAGO_COLLECTOR_ID:'123'}
describe('subscription trust boundaries',()=>{
 afterEach(()=>vi.unstubAllGlobals())
 it('accepts signed alphanumeric notification ids and rejects tampering',()=>{
  const signature='ts=123,v1='+createHmac('sha256','secret').update('id:abc123;request-id:r;ts:123;').digest('hex')
  expect(verifyWebhook({id:'ABC123',requestId:'r',signature},'secret')).toBe(true)
  expect(verifyWebhook({id:'abc124',requestId:'r',signature},'secret')).toBe(false)
 })
 it('binds authorization to merchant, reference, monthly price and frequency',()=>{
  const local={id:sid,amount:29990}
  expect(()=>validateSubscription(remote,local,env)).not.toThrow()
  for(const patch of [{collector_id:999},{external_reference:uid},{auto_recurring:{...remote.auto_recurring,transaction_amount:1}},{auto_recurring:{...remote.auto_recurring,frequency:12}},{auto_recurring:{...remote.auto_recurring,currency_id:'USD'}},{auto_recurring:{...remote.auto_recurring,free_trial:{frequency:1}}}]) expect(()=>validateSubscription({...remote,...patch},local,env)).toThrow()
 })
 it('requires a verified account and independent enablement before provider calls',async()=>{
  const fetch=vi.fn();vi.stubGlobal('fetch',fetch)
  await expect(subscriptionAction('subscribe',{env,db:{},user:null,body:{}})).rejects.toMatchObject({status:401})
  await expect(subscriptionAction('subscribe',{env,db:{},user:{id:uid,email:'u@test.test',email_confirmed_at:'now'},body:{}})).rejects.toMatchObject({status:503})
  expect(fetch).not.toHaveBeenCalled()
 })
 it('does not grant reports for a scheduled invoice without a real payment',async()=>{
  vi.stubGlobal('fetch',vi.fn(async()=>({ok:true,json:async()=>remote})))
  const chain={select:()=>chain,eq:()=>chain,maybeSingle:async()=>({data:{id:sid,amount:29990},error:null})}
  const db={from:()=>chain,rpc:vi.fn(async()=>({data:null,error:null}))}
  expect(await syncInvoice(db,env,{id:123,preapproval_id:'abc123',external_reference:sid,currency_id:'CLP',transaction_amount:29990,debit_date:'2026-09-08T00:00:00Z'})).toBe(null)
  expect(db.rpc.mock.calls.map(c=>c[0])).toEqual(['commerce_sync_subscription'])
 })
})

describe('monthly allowance database invariants',()=>{
 let db,order
 const start=new Date();start.setUTCDate(1);start.setUTCHours(0,0,0,0)
 const cycle=start.toISOString()
 beforeAll(async()=>{
  db=new PGlite()
  await db.exec('create schema auth;create table auth.users(id uuid primary key);create role anon;create role authenticated;create role service_role;')
  for(const name of ['202609070001_commerce','202609080001_subscriptions']) await db.exec(readFileSync(new URL(`../supabase/migrations/${name}.sql`,import.meta.url),'utf8'))
  await db.query('insert into auth.users values($1)',[uid])
  await db.query("insert into commerce_subscriptions(id,user_id,email,provider_id,status) values($1,$2,'u@example.test','abc123','authorized')",[sid,uid])
 },30000)
 afterAll(async()=>{await db?.close()})
 it('blocks a second active subscription for the same user',async()=>{
  await expect(db.query("insert into commerce_subscriptions(user_id,email) values($1,'u@example.test')",[uid])).rejects.toThrow('commerce_one_subscription')
 })
 it('grants a single 30-report cycle after payment; duplicates do not refill it',async()=>{
  for(let n=0;n<2;n++)order=(await db.query("select commerce_apply_invoice($1,'invoice1','pay1','approved',now(),$2) as id",[sid,cycle])).rows[0].id
  expect((await db.query('select count(*)::int as n from commerce_orders')).rows[0].n).toBe(1)
  expect((await db.query('select credits from commerce_orders')).rows[0].credits).toBe(30)
  for(let n=0;n<31;n++){
   const report=(await db.query("insert into commerce_reports(title,storage_path,ready,available_until) values('Real report',$1,true,now()+interval '2 days') returning id",[String(n)])).rows[0].id
   if(n<30){await db.query('select commerce_redeem($1,$2)',[order,report]);await db.query('select commerce_redeem($1,$2)',[order,report])}
   else await expect(db.query('select commerce_redeem($1,$2)',[order,report])).rejects.toThrow('no_credits')
  }
  await db.query("select commerce_apply_invoice($1,'invoice1','pay1','approved',now(),$2)",[sid,cycle])
  expect((await db.query('select count(*)::int as n from commerce_redemptions')).rows[0].n).toBe(30)
 })
 it('cancelled renewal preserves paid access; stale authorizations cannot reactivate it',async()=>{
  await db.query("select commerce_sync_subscription($1,'abc123','cancelled',now(),null)",[sid])
  await db.query("select commerce_sync_subscription($1,'abc123','authorized',now()+interval '1 minute',null)",[sid])
  expect((await db.query('select status from commerce_subscriptions')).rows[0].status).toBe('cancelled')
  expect((await db.query('select status from commerce_orders')).rows[0].status).toBe('approved')
 })
 it('revokes a refunded cycle without losing its history or restoring credits on replay',async()=>{
  await db.query("select commerce_apply_invoice($1,'invoice1','pay1','refunded',now(),$2)",[sid,cycle])
  await db.query("select commerce_apply_invoice($1,'invoice1','pay1','approved',now()+interval '1 minute',$2)",[sid,cycle])
  expect((await db.query('select status from commerce_orders')).rows[0].status).toBe('refunded')
 })
 it('grants nothing for failed renewals; a successful retry creates no second allowance',async()=>{
  const next=new Date(start);next.setUTCMonth(next.getUTCMonth()+1)
  const r=(await db.query("select commerce_apply_invoice($1,'invoice2','rejected2','rejected',now(),$2) as id",[sid,next.toISOString()])).rows[0].id
  const report=(await db.query('select id from commerce_reports limit 1')).rows[0].id
  await expect(db.query('select commerce_redeem($1,$2)',[r,report])).rejects.toThrow('not_paid')
  await db.query("select commerce_apply_invoice($1,'invoice2','approved2','approved',now(),$2)",[sid,next.toISOString()])
  await expect(db.query('select commerce_redeem($1,$2)',[r,report])).rejects.toThrow('credits_expired')
  expect((await db.query("select count(*)::int as n from commerce_orders where invoice_id='invoice2'")).rows[0].n).toBe(1)
 })
 it('expires unused monthly credits and prevents a second invoice for the same cycle',async()=>{
  const old=(await db.query("select commerce_apply_invoice($1,'oldinvoice','oldpayment','approved',now(),'2020-01-31T12:00:00Z') as id",[sid])).rows[0].id
  const report=(await db.query('select id from commerce_reports limit 1')).rows[0].id
  await expect(db.query('select commerce_redeem($1,$2)',[old,report])).rejects.toThrow('credits_expired')
  expect(new Date((await db.query('select expires_at from commerce_orders where id=$1',[old])).rows[0].expires_at).toISOString()).toBe('2020-02-29T12:00:00.000Z')
  await expect(db.query("select commerce_apply_invoice($1,'duplicatecycle','differentpayment','approved',now(),'2020-01-31T12:00:00Z')",[sid])).rejects.toThrow('commerce_one_monthly_cycle')
 })
 it('does not let browser roles read subscriptions or grant monthly credit',async()=>{
  await db.exec('set role authenticated')
  await expect(db.query('select * from commerce_subscriptions')).rejects.toThrow('permission denied')
  await expect(db.query("select commerce_apply_invoice($1,'i','p','approved',now(),now())",[sid])).rejects.toThrow('permission denied')
  await db.exec('reset role')
 })
})

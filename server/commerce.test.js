import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createHmac } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { PGlite } from '@electric-sql/pglite'
import { guestToken, ownsOrder, readiness, validatePayment, verifyWebhook } from './commerce-core.js'

const id='11111111-1111-4111-8111-111111111111'
const reportIds=['21111111-1111-4111-8111-111111111111','31111111-1111-4111-8111-111111111111','41111111-1111-4111-8111-111111111111','51111111-1111-4111-8111-111111111111']
const secret='test-secret-never-production'
describe('payment trust boundaries',()=>{
 it('requires all fulfillment configuration and explicit enablement',()=>{expect(readiness({COMMERCE_ENABLED:'true'})).toBe(false)})
 it('rejects forged and mismatched webhook identifiers',()=>{
  const signature=`ts=123,v1=${createHmac('sha256',secret).update('id:45;request-id:req;ts:123;').digest('hex')}`
  expect(verifyWebhook({id:'45',requestId:'req',signature},secret)).toBe(true)
  expect(verifyWebhook({id:'46',requestId:'req',signature},secret)).toBe(false)
  expect(verifyWebhook({id:'45',requestId:'req',signature:'ts=1,v1=no'},secret)).toBe(false)
 })
 it('binds guest access to order, expiry and account ownership',()=>{
  const order={id,created_at:new Date().toISOString(),user_id:null}
  const token=guestToken(order,secret)
  expect(ownsOrder(order,null,token,secret)).toBe(true)
  expect(ownsOrder({...order,id:reportIds[0]},null,token,secret)).toBe(false)
  expect(ownsOrder({...order,user_id:'owner'},{id:'attacker'},token,secret)).toBe(false)
  expect(ownsOrder({...order,user_id:'owner'},{id:'owner'},'',secret)).toBe(true)
  const old={...order,created_at:'2020-01-01'}
  expect(ownsOrder(old,null,guestToken(old,secret),secret)).toBe(false)
 })
 it('checks seller, currency, amount and order reference; partial refunds revoke access',()=>{
  const order={id,amount:4990}
  const p={collector_id:123,external_reference:id,currency_id:'CLP',transaction_amount:4990,status:'approved',date_last_updated:new Date().toISOString()}
  expect(validatePayment(p,order,123)).toBe('approved')
  for(const patch of [{collector_id:456},{external_reference:'another'},{currency_id:'USD'},{transaction_amount:1}]) expect(()=>validatePayment({...p,...patch},order,123)).toThrow()
  expect(validatePayment({...p,transaction_amount_refunded:10},order,123)).toBe('refunded')
 })
})

describe('commerce database invariants',()=>{
 let db
 beforeAll(async()=>{
  db=new PGlite()
  await db.exec('create schema auth; create table auth.users(id uuid primary key); create role anon; create role authenticated; create role service_role;')
  await db.exec(readFileSync(new URL('../supabase/migrations/202609070001_commerce.sql',import.meta.url),'utf8'))
  for(const report of reportIds) await db.query("insert into commerce_reports(id,title,storage_path,ready,available_until) values($1::uuid,'Prepared report',$1::text,true,now()+interval '1 day')",[report])
  await db.query("insert into commerce_orders(id,email,plan_id,amount,credits,initial_report_id) values($1,'guest@example.test','pack',11990,3,$2)",[id,reportIds[0]])
 },30000)
 afterAll(async()=>{await db?.close()})
 it('grants exactly once for duplicate approved notifications',async()=>{
  for(let i=0;i<2;i++) await db.query("select commerce_apply_payment($1,'123','approved','2026-09-07T10:00:00Z')",[id])
  expect((await db.query('select count(*)::integer as n from commerce_redemptions')).rows[0].n).toBe(1)
 })
 it('reserves remaining credits without overspending and reopening is free',async()=>{
  await Promise.all(reportIds.slice(1,3).map(r=>db.query('select commerce_redeem($1,$2)',[id,r])))
  await db.query('select commerce_redeem($1,$2)',[id,reportIds[1]])
  await expect(db.query('select commerce_redeem($1,$2)',[id,reportIds[3]])).rejects.toThrow('no_credits')
  expect((await db.query('select count(*)::integer as n from commerce_redemptions')).rows[0].n).toBe(3)
 })
 it('revokes refunds and ignores out-of-order approvals',async()=>{
  await db.query("select commerce_apply_payment($1,'123','refunded','2026-09-07T12:00:00Z')",[id])
  await db.query("select commerce_apply_payment($1,'123','approved','2026-09-07T11:00:00Z')",[id])
  expect((await db.query('select status from commerce_orders where id=$1',[id])).rows[0].status).toBe('refunded')
  await expect(db.query('select commerce_redeem($1,$2)',[id,reportIds[3]])).rejects.toThrow('not_paid')
  await expect(db.query("select commerce_apply_payment($1,'other','approved',now())",[id])).rejects.toThrow('payment_mismatch')
 })
 it('denies direct browser access to orders and privileged functions',async()=>{
  await db.exec('set role authenticated')
  await expect(db.query('select * from commerce_orders')).rejects.toThrow('permission denied')
  await expect(db.query('select commerce_redeem($1,$2)',[id,reportIds[0]])).rejects.toThrow('permission denied')
  await db.exec('reset role')
 })
 it('limits repeated checkout attempts in a shared database',async()=>{
  expect((await db.query("select commerce_rate_limit('ip',1) as ok")).rows[0].ok).toBe(true)
  expect((await db.query("select commerce_rate_limit('ip',1) as ok")).rows[0].ok).toBe(false)
 })
})

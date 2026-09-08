import { afterEach, describe, expect, it, vi } from 'vitest'
import { runJobs } from './commerce.js'
import nodemailer from 'nodemailer'
vi.mock('nodemailer',()=>({default:{createTransport:vi.fn()}}))
const orderId='11111111-1111-4111-8111-111111111111',reportId='21111111-1111-4111-8111-111111111111'
function chain(data){const q={then:resolve=>Promise.resolve({data,error:null}).then(resolve)};for(const k of ['select','eq','is','or','order','limit','update','maybeSingle'])q[k]=vi.fn(()=>q);return q}
function setup({status='approved',claimed=true}={}){
 const order={id:orderId,email:'recipient@example.test',plan_id:'pack',amount:11990,created_at:'2026-09-07T12:00:00Z',status}
 const queues=[chain([{order_id:orderId,report_id:reportId}]),chain(order),chain(claimed?[{order_id:orderId}]:[]),chain({id:reportId,title:'Report',storage_path:'private.pdf',ready:true}),chain([])]
 const updates=queues.slice()
 const db={from:vi.fn(()=>queues.shift()),storage:{from:vi.fn(()=>({download:async()=>({data:new Blob(['%PDF-1.4 report']),error:null})}))}}
 return {db,updates}
}
const env={SMTP_USER:'sender@example.test',SMTP_PASS:'test-password',EMAIL_FROM:'AUTOINDEX <sender@example.test>',ORDER_ACCESS_SECRET:'test-secret',APP_URL:'https://app.example.test'}
afterEach(()=>vi.clearAllMocks())
describe('PDF delivery worker',()=>{
 it('sends the stored PDF with the paid amount and marks delivery separately',async()=>{
  const sendMail=vi.fn(async()=>({accepted:['recipient@example.test']}));nodemailer.createTransport.mockReturnValue({sendMail})
  const {db,updates}=setup()
  expect(await runJobs(db,env,{orderId})).toEqual({reconciled:0,sent:1,failed:0})
  const mail=sendMail.mock.calls[0][0]
  expect(mail.to).toBe('recipient@example.test');expect(mail.text).toContain('$11.990 CLP');expect(mail.text).toContain(`/purchase/${orderId}#`)
  expect(mail.attachments[0].content.toString()).toBe('%PDF-1.4 report')
  expect(updates[4].update).toHaveBeenCalledWith(expect.objectContaining({email_sent_at:expect.any(String)}))
 })
 it('leaves a failed SMTP delivery retryable without changing payment state',async()=>{
  nodemailer.createTransport.mockReturnValue({sendMail:vi.fn(async()=>{throw new Error('smtp unavailable')})})
  const {db,updates}=setup()
  expect(await runJobs(db,env,{orderId})).toEqual({reconciled:0,sent:0,failed:1})
  expect(updates[4].update).toHaveBeenCalledWith({email_claimed_at:null})
  expect(updates[4].eq).toHaveBeenCalledWith('email_claimed_at',expect.any(String))
 })
 it('does not send refunded orders or jobs already claimed by another worker',async()=>{
  const sendMail=vi.fn();nodemailer.createTransport.mockReturnValue({sendMail})
  expect((await runJobs(setup({status:'refunded'}).db,env,{orderId})).sent).toBe(0)
  expect((await runJobs(setup({claimed:false}).db,env,{orderId})).sent).toBe(0)
  expect(sendMail).not.toHaveBeenCalled()
 })
})

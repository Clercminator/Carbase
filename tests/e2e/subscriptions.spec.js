import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mockAuth } from './auth-fixture.js'

test('monthly checkout requires an account and remains gated',async({page})=>{
 await mockAuth(page)
 await page.goto('/subscribe/pro')
 await expect(page).toHaveURL(/auth\?next=%2Fsubscribe%2Fpro/)
})
test('Profesional explains recurring consent before tokenizing a card',async({page})=>{
 await mockAuth(page,{signedIn:true})
 await page.route('https://sdk.mercadopago.com/js/v2*',r=>r.fulfill({contentType:'application/javascript',body:`window.MercadoPago=class{bricks(){return {create:async(type,id,s)=>{const b=document.createElement('button');b.textContent='Autorizar tarjeta de prueba';b.onclick=()=>s.callbacks.onSubmit({token:'test-card-token-123'});document.getElementById(id).append(b);s.callbacks.onReady?.();return {unmount:()=>b.remove()}}}}}` }))
 let submitted=false
 await page.route('**/api/commerce?*',r=>{
  const action=new URL(r.request().url()).searchParams.get('action')
  if(action==='config')return r.fulfill({json:{enabled:true,subscriptionsEnabled:true,publicKey:'TEST-public'}})
  if(action==='subscribe'){expect(r.request().postDataJSON()).toEqual({cardToken:'test-card-token-123',acceptRecurring:true});submitted=true;return r.fulfill({json:{submitted:true}})}
  return r.fulfill({json:{orders:[],subscriptions:[]}})
 })
 await page.goto('/subscribe/pro')
 await expect(page.getByRole('heading',{name:'$29.990 CLP al mes'})).toBeVisible()
 await expect(page.getByRole('button',{name:'Autorizar tarjeta de prueba'})).toHaveCount(0)
 await page.getByRole('checkbox').check()
 await page.getByRole('button',{name:'Autorizar tarjeta de prueba'}).click()
 await expect(page).toHaveURL(/\/account$/)
 expect(submitted).toBe(true)
})
test('cancellation preserves the paid monthly purchase and downloads',async({page})=>{
 await mockAuth(page,{signedIn:true})
 let cancelled=false
 await page.route('**/api/commerce?*',r=>{
  const action=new URL(r.request().url()).searchParams.get('action')
  if(action==='cancelSubscription'){cancelled=true;return r.fulfill({json:{cancelled:true}})}
  if(action==='subscriptions')return r.fulfill({json:{subscriptions:[{id:'s1',status:cancelled?'cancelled':'authorized',amount:29990,cancelRequested:cancelled}]}})
  return r.fulfill({json:{orders:[{id:'o1',planId:'pro',amount:29990,status:'approved',createdAt:'2026-09-08',expiresAt:'2026-10-08',creditsRemaining:30,reports:[]}]}})
 })
 await page.goto('/account')
 await expect(page.getByText('Renovación automática autorizada')).toBeVisible()
 await page.getByRole('button',{name:'Cancelar renovación'}).click()
 await expect(page.getByText('¿Cancelar futuros cobros? Conservas el período que ya pagaste.')).toBeVisible()
 await page.getByRole('button',{name:'Confirmar cancelación'}).click()
 await expect(page.getByText('Renovación cancelada',{exact:true})).toBeVisible()
 await expect(page.getByText('Pago aprobado',{exact:true})).toBeVisible()
 await expect(page.getByRole('heading',{name:'Profesional · cuota mensual'})).toBeVisible()
 expect((await new AxeBuilder({page}).analyze()).violations.filter(v=>['serious','critical'].includes(v.impact))).toEqual([])
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
})
test('disabled monthly billing never renders a payment form',async({page})=>{
 await mockAuth(page,{signedIn:true})
 await page.route('**/api/commerce?*',r=>r.fulfill({json:{enabled:false,subscriptionsEnabled:false,publicKey:null}}))
 await page.goto('/subscribe/pro')
 await expect(page.getByRole('status')).toContainText('No se realizará ningún cobro')
 await expect(page.getByRole('checkbox')).toHaveCount(0)
})

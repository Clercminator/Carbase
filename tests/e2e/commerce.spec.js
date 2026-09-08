import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mockAuth } from './auth-fixture.js'

const id='11111111-1111-4111-8111-111111111111'
const reportId='21111111-1111-4111-8111-111111111111'
const token='a'.repeat(64)
const order={id,planId:'pack',amount:11990,status:'approved',createdAt:'2026-09-07T12:00:00Z',expiresAt:'2026-12-06T12:00:00Z',credits:3,creditsRemaining:2,reports:[{id:reportId,title:'Informe de mercado preparado',deliveryStatus:'pending'}]}

test('guest checkout explains unavailable purchases without requiring login',async({page})=>{
 await page.route('**/api/commerce?*',r=>r.fulfill({json:{enabled:false,publicKey:null}}))
 await page.goto('/checkout?plan=report')
 await expect(page.getByRole('heading',{name:'Tu informe, en tu correo.'})).toBeVisible()
 await expect(page.getByText('No necesitas crear una cuenta para comprar.')).toBeVisible()
 await expect(page.getByRole('status')).toContainText('No se realizará ningún cobro')
 expect((await new AxeBuilder({page}).analyze()).violations.filter(v=>['serious','critical'].includes(v.impact))).toEqual([])
})

test('guest purchase uses a private token and downloads the paid PDF',async({page})=>{
 await page.route('**/api/commerce?*',async route=>{
  const url=new URL(route.request().url())
  expect(route.request().headers()['x-order-token']).toBe(token)
  if(url.searchParams.get('action')==='download')return route.fulfill({contentType:'application/pdf',body:'%PDF-1.4\nTest fixture'})
  return route.fulfill({json:{order}})
 })
 await page.goto(`/purchase/${id}#${token}`)
 await expect(page.getByText('Pago aprobado',{exact:true})).toBeVisible()
 await expect(page).not.toHaveURL(new RegExp(token))
 const download=page.waitForEvent('download')
 await page.getByRole('button',{name:'Descargar PDF'}).click()
 expect((await download).suggestedFilename()).toBe('informe-carbase.pdf')
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
})

test('account shows actual purchase amounts and claims prior guest purchases',async({page})=>{
 await mockAuth(page,{signedIn:true})
 await page.route('**/api/commerce?*',route=>{
  const action=new URL(route.request().url()).searchParams.get('action')
  return route.fulfill({json:action==='claim'?{claimed:1}:action==='subscriptions'?{subscriptions:[]}:{orders:[order]}})
 })
 await page.goto('/account')
 await expect(page.getByRole('heading',{name:'Mi cuenta',exact:true})).toBeVisible()
 await expect(page.getByText(/\$11.990 CLP/)).toBeVisible()
 await page.getByRole('button',{name:'Vincular mis compras anteriores'}).click()
 await expect(page.getByRole('status')).toContainText('Vinculamos 1 compra')
 expect((await new AxeBuilder({page}).analyze()).violations.filter(v=>['serious','critical'].includes(v.impact))).toEqual([])
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
})

test('account sign-in preserves its destination',async({page})=>{
 await mockAuth(page)
 await page.goto('/account')
 await expect(page).toHaveURL(/auth\?next=%2Faccount/)
 await page.getByLabel('Correo electrónico').fill('qa@example.test')
 await page.getByLabel('Contraseña',{exact:true}).fill('correct-password')
 await page.route('**/api/commerce?*',r=>r.fulfill({json:{orders:[],subscriptions:[]}}))
 await page.getByRole('button',{name:'Iniciar sesión',exact:true}).click()
 await expect(page).toHaveURL(/\/account$/)
})

test('pack credits accept the generated checkout link for another report',async({page})=>{
 let redeemed=false
 await page.route('**/api/commerce?*',r=>{
  if(new URL(r.request().url()).searchParams.get('action')==='redeem'){
   expect(r.request().postDataJSON()).toEqual({orderId:id,reportId});redeemed=true
  }
  return r.fulfill({json:{order}})
 })
 await page.goto(`/purchase/${id}#${token}`)
 await page.getByLabel('Enlace de otro análisis').fill(`https://carbase-ten.vercel.app/checkout?plan=report&report=${reportId}`)
 await page.getByRole('button',{name:'Usar un crédito'}).click()
 await expect(page.getByLabel('Enlace de otro análisis')).toHaveValue('')
 expect(redeemed).toBe(true)
})

test('guest submits Bricks payment and reaches confirmed purchase without signup',async({page})=>{
 await page.route('https://sdk.mercadopago.com/js/v2*',route=>route.fulfill({contentType:'application/javascript',body:`
 window.MercadoPago=class { bricks(){ return { create:async(type,id,settings)=>{
 const button=document.createElement('button');button.textContent='Pagar con tarjeta de prueba';
 button.onclick=()=>settings.callbacks.onSubmit({selectedPaymentMethod:'credit_card',formData:{token:'test-card-token-123',payment_method_id:'visa',installments:1,payer:{email:'guest@example.test'}}});
 document.getElementById(id).append(button);settings.callbacks.onReady?.();
 return {unmount:()=>button.remove()};
 } }; } };
 `}))
 let created=false,paid=false
 await page.route('**/api/commerce?*',route=>{
  const action=new URL(route.request().url()).searchParams.get('action')
  if(action==='config')return route.fulfill({json:{enabled:true,publicKey:'TEST-public-key'}})
  if(action==='report')return route.fulfill({json:{id:reportId,title:'Informe listo para entrega'}})
  if(action==='create'){
   expect(route.request().postDataJSON()).toEqual({planId:'pack',reportId,email:'guest@example.test'});created=true
   return route.fulfill({status:201,json:{order:{...order,status:'pending'},token}})
  }
  if(action==='pay'){
   expect(created).toBe(true);expect(route.request().headers()['x-order-token']).toBe(token);paid=true
   return route.fulfill({json:{order}})
  }
  return route.fulfill({json:{order}})
 })
 await page.goto(`/checkout?plan=pack&report=${reportId}`)
 await page.getByLabel('Correo de entrega').fill('guest@example.test')
 await page.getByRole('button',{name:'Continuar al pago'}).click()
 await page.getByRole('button',{name:'Pagar con tarjeta de prueba'}).click()
 await expect(page).toHaveURL(new RegExp(`/purchase/${id}`))
 await expect(page.getByText('Pago aprobado',{exact:true})).toBeVisible()
 expect(paid).toBe(true)
})

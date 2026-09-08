import { APP_NAME } from '../config/brand.js'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { initMercadoPago, Payment } from '@mercadopago/sdk-react'
import SiteHeader from '../components/SiteHeader.jsx'
import PageMeta from '../components/PageMeta.jsx'
import { commerce, rememberPurchase } from '../lib/commerce.js'
import { useAuth } from '../lib/authContext.js'
import { pricingPlans, formatPlanPrice } from '../data/pricingPlans.js'

export default function CheckoutPage() {
 const [params]=useSearchParams()
 return <CheckoutForm key={params.toString()} params={params}/>
}
function CheckoutForm({params}) {
 const plan=pricingPlans.find(p=>p.id===params.get('plan') && ['report','pack'].includes(p.id))
 const reportId=params.get('report')
 const {session}=useAuth()
 const navigate=useNavigate()
 const [email,setEmail]=useState(null)
 const [config,setConfig]=useState(null)
 const [report,setReport]=useState(null)
 const [purchase,setPurchase]=useState(null)
 const [error,setError]=useState('')
 const [busy,setBusy]=useState(false)
 useEffect(()=>{
  let active=true
  commerce('config').then(async c=>{
   if (!active) return
   if(c.enabled) {
    initMercadoPago(c.publicKey,{locale:'es-CL'})
    if(reportId) { const r=await commerce('report',{query:{id:reportId}}); if(active) setReport(r) }
   }
   if(active) setConfig(c)
  }).catch(e=>{if(active){setError(e.message);setConfig({enabled:false})}})
  return ()=>{active=false}
 },[reportId])
 async function start(event) {
  event.preventDefault();setBusy(true);setError('')
  try {
   const result=await commerce('create',{method:'POST',body:{planId:plan.id,reportId,email:email??session?.user.email}})
   rememberPurchase(result.order.id,result.token);setPurchase(result)
  } catch(e){setError(e.message)} finally {setBusy(false)}
 }
 async function pay({formData}) {
  setError('')
  try {
   await commerce('pay',{method:'POST',token:purchase.token,body:{orderId:purchase.order.id,formData}})
   navigate(`/purchase/${purchase.order.id}`)
  } catch(e) { setError(e.message);navigate(`/purchase/${purchase.order.id}`) }
 }
 return <div className="methodology-page"><PageMeta title={"Comprar informe — " + APP_NAME} description="Compra un informe con entrega por correo, sin crear una cuenta."/><SiteHeader theme="light"/>
 <main className="commerce-main content-container"><Link className="back-link" to="/pricing">Volver a planes</Link><h1>Tu informe, en tu correo.</h1><p>No necesitas crear una cuenta para comprar.</p>
 {!plan?<p role="alert">Selecciona un informe individual o un pack desde <Link to="/pricing">Planes</Link>.</p>:<section className="commerce-panel"><h2>{plan.name}</h2><strong className="commerce-amount">{formatPlanPrice(plan.priceClp)}</strong><p>CLP · IVA incluido · pago único</p>
 {!config?<p role="status">Comprobando disponibilidad…</p>:!config.enabled?<p role="status">Las compras aún no están disponibles. No se realizará ningún cobro.</p>:!report?<p>Primero elige un informe disponible desde tu análisis. <Link to="/deal-check">Ir al análisis</Link></p>:<><h3>{report.title}</h3>{!purchase?<form onSubmit={start} className="commerce-form"><label>Correo de entrega<input type="email" required maxLength={254} value={email??session?.user.email??''} onChange={e=>setEmail(e.target.value)} autoComplete="email"/></label><p>Revisa tu correo antes de continuar. Te enviaremos el PDF y un enlace privado para gestionar tu compra.{plan.id==='pack'?' El pack incluye este informe y dos créditos adicionales, válidos por 90 días.':''}</p><button className="pricing-cta" disabled={busy}>{busy?'Preparando compra…':'Continuar al pago'}</button></form>:<><Payment initialization={{amount:purchase.order.amount,payer:{email:email??session?.user.email}}} customization={{paymentMethods:{creditCard:'all',debitCard:'all',maxInstallments:1,minInstallments:1}}} onSubmit={pay} onError={()=>setError('No pudimos cargar el formulario de pago. Recarga la página o consulta tu compra.')} /><Link to={`/purchase/${purchase.order.id}`}>Consultar estado de mi compra</Link></>}</>}
 </section>}{error?<p role="alert">{error}</p>:null}<p>Un informe de mercado no reemplaza la revisión legal ni una inspección mecánica.</p></main></div>
}

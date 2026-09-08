import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CardPayment, initMercadoPago } from '@mercadopago/sdk-react'
import SiteHeader from '../components/SiteHeader.jsx'
import PageMeta from '../components/PageMeta.jsx'
import { APP_NAME } from '../config/brand.js'
import { useAuth } from '../lib/authContext.js'
import { commerce } from '../lib/commerce.js'

export default function SubscriptionPage() {
 const {session}=useAuth()
 const navigate=useNavigate()
 const [config,setConfig]=useState(null)
 const [consent,setConsent]=useState(false)
 const [error,setError]=useState('')
 const [submitted,setSubmitted]=useState(false)
 useEffect(()=>{
  let active=true
  commerce('config').then(c=>{if(active){if(c.subscriptionsEnabled)initMercadoPago(c.publicKey,{locale:'es-CL'});setConfig(c)}}).catch(e=>{if(active)setError(e.message)})
  return ()=>{active=false}
 },[])
 async function subscribe(formData) {
  if(!consent || submitted)return
  setSubmitted(true);setError('')
  try {await commerce('subscribe',{method:'POST',body:{cardToken:formData.token,acceptRecurring:true}});navigate('/account')}
  catch(e){setError(e.message)}
 }
 return <div className="methodology-page"><PageMeta title={`Profesional — ${APP_NAME}`} description="Plan mensual de 30 informes para una cuenta."/><SiteHeader theme="light"/>
 <main className="commerce-main content-container"><Link to="/pricing">Volver a planes</Link><h1>Profesional</h1><section className="commerce-panel"><h2>$29.990 CLP al mes</h2><p>IVA incluido · 30 informes por período pagado · una cuenta</p><p>Los créditos no se acumulan. Se habilitan cuando se confirma el pago mensual; autorizar una tarjeta no confirma el primer cobro. Puedes cancelar la renovación desde Mi cuenta y conservar el acceso hasta el final del período pagado.</p><p>Los informes requieren datos suficientes. El seguimiento de publicaciones y la terminal continúan en demostración.</p>
 {!config&&!error?<p role="status">Comprobando disponibilidad…</p>:!config?.subscriptionsEnabled?<p role="status">El plan mensual aún no está disponible. No se realizará ningún cobro.</p>:submitted?<p role="status">Consulta Mi cuenta para verificar la solicitud antes de volver a intentar.</p>:<><p>Cuenta: {session.user.email}</p><label><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/> Autorizo el cobro automático de $29.990 CLP cada mes hasta cancelar.</label>{consent?<CardPayment initialization={{amount:29990,payer:{email:session.user.email}}} customization={{paymentMethods:{minInstallments:1,maxInstallments:1}}} onSubmit={subscribe} onError={()=>setError('No pudimos cargar la tarjeta. Intenta nuevamente más tarde.')}/>:null}</>}
 {error?<p role="alert">{error}</p>:null}<p><Link to="/account">Ir a Mi cuenta</Link></p></section></main></div>
}

import { APP_SLUG, APP_NAME } from '../config/brand.js'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader.jsx'
import PageMeta from '../components/PageMeta.jsx'
import { commerce, purchaseToken } from '../lib/commerce.js'
import { formatPlanPrice } from '../data/pricingPlans.js'

const labels={pending:'Pendiente de pago',submitted:'Verificando pago',approved:'Pago aprobado',rejected:'Pago rechazado',cancelled:'Pago cancelado',refunded:'Pago reembolsado',charged_back:'Pago con contracargo'}
export function PurchaseCard({order,token='',onChange}) {
 const [error,setError]=useState('')
 const [busy,setBusy]=useState(false)
 const [reportId,setReportId]=useState('')
 async function download(report) {
  setBusy(true);setError('')
  try {
   const blob=await commerce('download',{token,query:{id:order.id,report:report.id}})
   const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`informe-${APP_SLUG}.pdf`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
  } catch(e){setError(e.message)} finally{setBusy(false)}
 }
 async function redeem(e) {
  e.preventDefault();setBusy(true);setError('')
  try{await commerce('redeem',{method:'POST',token,body:{orderId:order.id,reportId:new URL(reportId,window.location.origin).searchParams.get('report') || new URL(reportId,window.location.origin).pathname.split('/').filter(Boolean).at(-1)}});setReportId('');await onChange()}catch(e){setError(e.message)}finally{setBusy(false)}
 }
 return <article className="commerce-panel"><h2>{order.planId==='pro'?'Profesional · cuota mensual':order.planId==='pack'?'Compara 3':'Informe individual'}</h2><p>{new Date(order.createdAt).toLocaleDateString('es-CL')} · {formatPlanPrice(order.amount)} CLP · IVA incluido</p><strong>{labels[order.status]||'Verificando estado'}</strong><p className="commerce-reference">Compra {order.id}</p>
 {order.status==='submitted'?<p>Estamos confirmando el pago. No vuelvas a pagar mientras verificamos esta compra.</p>:null}
 {order.status==='approved'?<><p>Créditos disponibles: <strong>{order.creditsRemaining}</strong>{order.expiresAt?` · Vencen el ${new Date(order.expiresAt).toLocaleDateString('es-CL')}`:''}</p>
 <ul className="commerce-reports">{order.reports.map(report=><li key={report.id}><div><strong>{report.title}</strong><p>{report.deliveryStatus==='sent'?'Correo enviado al servicio de entrega':'Entrega por correo pendiente; puedes descargarlo aquí.'}</p></div><button disabled={busy} onClick={()=>download(report)}>Descargar PDF</button></li>)}</ul>
 {order.creditsRemaining>0?<form className="commerce-form" onSubmit={redeem}><label>Enlace de otro análisis<input required value={reportId} onChange={e=>setReportId(e.target.value)} placeholder="Pega el enlace de tu análisis"/></label><p>Usa tus créditos en otro análisis que tenga un informe disponible.</p><button disabled={busy}>Usar un crédito</button></form>:null}</>:null}{error?<p role="alert">{error}</p>:null}</article>
}
export default function PurchasePage() {
 const {id}=useParams()
 return <PurchaseDetails key={id} id={id}/>
}
function PurchaseDetails({id}) {
 const [token]=useState(()=>purchaseToken(id))
 const [order,setOrder]=useState(null)
 const [error,setError]=useState('')
 async function refresh(){try{const result=await commerce('order',{token,query:{id}});setOrder(result.order);setError('')}catch(e){setError(e.message)}}
 useEffect(()=>{
  let active=true
  const load=()=>commerce('order',{token,query:{id}}).then(r=>{if(active){setOrder(r.order);setError('')}}).catch(e=>{if(active)setError(e.message)})
  load();const timer=setInterval(load,10000)
  return ()=>{active=false;clearInterval(timer)}
 },[id,token])
 return <div className="methodology-page"><PageMeta title={"Mi compra — " + APP_NAME} description="Consulta el pago y descarga tus informes."/><SiteHeader theme="light"/><main className="commerce-main content-container"><h1>Mi compra</h1>{error?<p role="alert">{error}</p>:null}{order?<PurchaseCard order={order} token={token} onChange={refresh}/>:!error?<p role="status">Consultando compra…</p>:null}<button className="pricing-cta" onClick={refresh}>Actualizar estado</button><p><Link to="/account">Ver mis compras en mi cuenta</Link></p><p>Si compraste como invitado, conserva el enlace privado recibido por correo. Para vincular compras a una cuenta, confirma ese mismo correo.</p></main></div>
}

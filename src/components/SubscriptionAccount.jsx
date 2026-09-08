import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { commerce } from '../lib/commerce.js'

const labels={submitted:'Verificando solicitud',pending:'Pendiente de autorización',authorized:'Renovación automática autorizada',paused:'Renovación pausada',cancelled:'Renovación cancelada'}
export default function SubscriptionAccount() {
 const [items,setItems]=useState(null)
 const [error,setError]=useState('')
 const [busy,setBusy]=useState(false)
 const [confirm,setConfirm]=useState(null)
 async function refresh(){const r=await commerce('subscriptions');setItems(r.subscriptions);setError('')}
 useEffect(()=>{let active=true;commerce('subscriptions').then(r=>{if(active)setItems(r.subscriptions)}).catch(e=>{if(active)setError(e.message)});return()=>{active=false}},[])
 async function cancel(id){setBusy(true);try{await commerce('cancelSubscription',{method:'POST',body:{subscriptionId:id}});await refresh();setConfirm(null)}catch(e){setError(e.message)}finally{setBusy(false)}}
 return <section className="commerce-panel"><h2>Mi plan mensual</h2>{error?<p role="alert">{error}</p>:null}{items===null&&!error?<p role="status">Consultando plan…</p>:null}{items?.length===0?<p>No tienes un plan mensual. <Link to="/subscribe/pro">Conocer Profesional</Link></p>:null}
 {items?.map(s=><div key={s.id}><h3>Profesional · $29.990 CLP/mes</h3><p>{labels[s.status]}</p>{s.cancelRequested&&s.status!=='cancelled'?<p role="status">Cancelación solicitada; pendiente de confirmación. Volveremos a intentarlo automáticamente.</p>:null}{s.nextPaymentAt&&s.status==='authorized'&&!s.cancelRequested?<p>Próximo cobro previsto: {new Date(s.nextPaymentAt).toLocaleDateString('es-CL')}</p>:null}<p>Los créditos de cada cuota aprobada y su vencimiento aparecen en Mis compras. Autorizar la renovación no significa que la cuota esté pagada.</p>{s.status!=='cancelled'?(confirm===s.id?<div><p>¿Cancelar futuros cobros? Conservas el período que ya pagaste.</p><button disabled={busy} onClick={()=>cancel(s.id)}>Confirmar cancelación</button> <button disabled={busy} onClick={()=>setConfirm(null)}>Mantener plan</button></div>:<button disabled={busy} onClick={()=>setConfirm(s.id)}>Cancelar renovación</button>):null}</div>)}
 {items?.length>0&&items.every(s=>s.status==='cancelled')?<p><Link to="/subscribe/pro">Contratar un nuevo período de Profesional</Link></p>:null}
 <button disabled={busy} onClick={()=>refresh().catch(e=>setError(e.message))}>Actualizar plan</button></section>
}

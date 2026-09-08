import { APP_NAME } from '../config/brand.js'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader.jsx'
import PageMeta from '../components/PageMeta.jsx'
import { commerce } from '../lib/commerce.js'
import { useAuth } from '../lib/authContext.js'
import { PurchaseCard } from './PurchasePage.jsx'

export default function AccountPage(){
 const {session}=useAuth()
 const [orders,setOrders]=useState(null)
 const [error,setError]=useState('')
 const [message,setMessage]=useState('')
 const [busy,setBusy]=useState(false)
 async function refresh(){const r=await commerce('history');setOrders(r.orders)}
 useEffect(()=>{let active=true;commerce('history').then(r=>{if(active)setOrders(r.orders)}).catch(e=>{if(active)setError(e.message)});return ()=>{active=false}},[])
 async function claim(){setBusy(true);setError('');try{const r=await commerce('claim',{method:'POST'});await refresh();setMessage(r.claimed?`Vinculamos ${r.claimed} compra(s) a tu cuenta.`:'No encontramos compras de invitado pendientes de vincular a tu correo.')}catch(e){setError(e.message)}finally{setBusy(false)}}
 return <div className="methodology-page"><PageMeta title={"Mi cuenta — " + APP_NAME} description="Historial de compras, informes y créditos."/><SiteHeader theme="light"/><main className="commerce-main content-container"><h1>Mi cuenta</h1><p>{session.user.email}</p><section className="commerce-panel"><h2>Compras como invitado</h2><p>Vincula las compras hechas con tu correo verificado para verlas aquí.</p><button className="pricing-cta" onClick={claim} disabled={busy}>{busy?'Vinculando…':'Vincular mis compras anteriores'}</button>{message?<p role="status">{message}</p>:null}</section><h2>Mis compras</h2>{error?<p role="alert">{error}</p>:null}{orders===null&&!error?<p role="status">Cargando compras…</p>:null}{orders?.length===0?<p>Aún no tienes compras. <Link to="/pricing">Explorar planes</Link></p>:null}{orders?.map(order=><PurchaseCard key={order.id} order={order} onChange={refresh}/>)}<p>Los planes mensuales todavía no están disponibles para contratación.</p></main></div>
}

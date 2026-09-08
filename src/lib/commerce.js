import { supabase } from './supabase.js'

export async function commerce(action, { method='GET', body, token, query={} } = {}) {
 const { data } = supabase ? await supabase.auth.getSession() : {data:null}
 const headers = { 'Content-Type':'application/json' }
 if (data?.session?.access_token) headers.Authorization=`Bearer ${data.session.access_token}`
 if (token) headers['X-Order-Token']=token
 const response=await fetch(`/api/commerce?${new URLSearchParams({action,...query})}`,{method,headers,body:body?JSON.stringify(body):undefined})
 if (!response.ok) { const result=await response.json().catch(()=>({})); throw new Error(result.error || 'No pudimos conectar con el servicio de compras.') }
 return action==='download'?response.blob():response.json()
}
export function rememberPurchase(id,token) {
 try { sessionStorage.setItem(`purchase:${id}`,token) } catch { /* The emailed link remains available. */ }
}
export function purchaseToken(id) {
 const fragment=window.location.hash.slice(1)
 if (/^[a-f0-9]{64}$/.test(fragment)) {
  rememberPurchase(id,fragment)
  window.history.replaceState(null,'',window.location.pathname+window.location.search)
  return fragment
 }
 try { return sessionStorage.getItem(`purchase:${id}`) || '' } catch { return '' }
}

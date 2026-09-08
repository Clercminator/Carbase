// Read ONLY the ignored test file: never inherit production credentials from .env.
import { readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import process from 'node:process'
try {
 const env=parseEnv(readFileSync('.env.test.local','utf8'))
 const missing=['MERCADOPAGO_ACCESS_TOKEN','MERCADOPAGO_PUBLIC_KEY','MERCADOPAGO_COLLECTOR_ID','MERCADOPAGO_WEBHOOK_SECRET','MERCADOPAGO_TEST_BUYER_EMAIL'].filter(k=>!env[k])
 if(!env.MERCADOPAGO_ACCESS_TOKEN) throw new Error('No test token')
 const r=await fetch('https://api.mercadopago.com/users/me',{headers:{Authorization:`Bearer ${env.MERCADOPAGO_ACCESS_TOKEN}`},signal:AbortSignal.timeout(10000)})
 const user=await r.json()
 const testSeller=r.ok && user.tags?.includes('test_user')===true
 const collectorMatches=String(user.id)===env.MERCADOPAGO_COLLECTOR_ID
 console.log(JSON.stringify({missing,httpStatus:r.status,testPrefixedToken:env.MERCADOPAGO_ACCESS_TOKEN.startsWith('TEST-'),testSeller,collectorMatches,site:user.site_id,subscriptionTestReady:!missing.length&&testSeller&&collectorMatches&&user.site_id==='MLC'}))
} catch {console.error('Test credential check failed; no secret values were printed.');process.exitCode=1}

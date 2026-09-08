import { loadEnv } from 'vite'

const env = loadEnv('development', '.', '')
export const authUrl = env.VITE_SUPABASE_URL || (env.SUPABASE_PROJECT_ID ? `https://${env.SUPABASE_PROJECT_ID}.supabase.co` : 'https://auth-test.supabase.co')
const user = { id: '00000000-0000-4000-8000-000000000001', aud: 'authenticated', role: 'authenticated', email: 'test@example.test', app_metadata: {}, user_metadata: {} }
const session = { access_token: 'test-token', refresh_token: 'test-refresh', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user }

export async function mockAuth(page, { signedIn = false } = {}) {
  await page.route(`${authUrl}/auth/v1/**`, async (route) => {
    const url = new URL(route.request().url())
    if (url.pathname.endsWith('/logout') || url.pathname.endsWith('/recover')) return route.fulfill({ status: 200, json: {} })
    if (url.pathname.endsWith('/signup')) return route.fulfill({ status: 200, json: { user, session: null } })
    if (url.pathname.endsWith('/user')) return route.fulfill({ status: 200, json: user })
    const body = route.request().postDataJSON()
    if (body?.password === 'wrong-password') return route.fulfill({ status: 400, json: { error_code: 'invalid_credentials', msg: 'Invalid login credentials' } })
    return route.fulfill({ status: 200, json: session })
  })
  if (signedIn) await page.addInitScript(({ key, value }) => { localStorage.setItem(key, JSON.stringify(value)) }, { key: `sb-${new URL(authUrl).hostname.split('.')[0]}-auth-token`, value: session })
}

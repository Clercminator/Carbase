import { APP_NAME } from '../config/brand.js'
import { useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader.jsx'
import PageMeta from '../components/PageMeta.jsx'
import { useAuth } from '../lib/authContext.js'
import { supabase } from '../lib/supabase.js'

export default function AuthPage() {
  const [params] = useSearchParams()
  const recovery = params.get('mode') === 'recovery'
  const [formMode, setMode] = useState('login')
  const mode = recovery ? 'recovery' : formMode
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const { session, loading } = useAuth()
  const requested = params.get('next') || '/terminal'
  const next = /^\/(?:terminal|account)(?:\/|\?|$)/.test(requested) ? requested : '/terminal'
  const [callbackError] = useState(() => new URLSearchParams(window.location.hash.slice(1)).has('error') || params.has('error'))
  const title = { login: 'Iniciar sesión', signup: 'Crear cuenta', forgot: 'Recuperar contraseña', recovery: 'Nueva contraseña' }[mode]

  async function submit(event) {
    event.preventDefault()
    if (!supabase || busy) return
    setBusy(true); setError(''); setMessage('')
    try {
      let result
      if (mode === 'login') result = await supabase.auth.signInWithPassword({ email, password })
      if (mode === 'signup') {
        result = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth?next=${encodeURIComponent(next)}` } })
        if (!result.error) setMessage('Revisa tu correo para confirmar tu cuenta. Si ya tienes una cuenta, inicia sesión o recupera tu contraseña.')
      }
      if (mode === 'forgot') {
        result = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth?mode=recovery` })
        if (!result.error) setMessage('Si existe una cuenta con ese correo, recibirás un enlace para recuperar tu contraseña.')
      }
      if (mode === 'recovery') {
        result = await supabase.auth.updateUser({ password })
        if (!result.error) { setMessage('Contraseña actualizada. Ya puedes abrir tu terminal.'); setPassword('') }
      }
      if (result.error) {
        const code = result.error.code
        setError(code === 'invalid_credentials' ? 'Correo o contraseña incorrectos.' : code === 'email_not_confirmed' ? 'Confirma tu correo antes de iniciar sesión.' : code?.includes('rate_limit') ? 'Demasiados intentos. Espera unos minutos y vuelve a intentar.' : mode === 'recovery' ? 'No pudimos actualizar la contraseña. Solicita un nuevo enlace o usa una contraseña diferente.' : 'No pudimos completar la solicitud. Revisa tus datos e inténtalo nuevamente.')
      }
    } catch { setError('No pudimos conectar. Revisa tu conexión e inténtalo nuevamente.') }
    finally { setBusy(false) }
  }

  if (!loading && session && !recovery) return <Navigate to={next} replace />
  return <div className="methodology-page">
    <PageMeta title={`${title} — ${APP_NAME}`} description={"Accede a tu cuenta " + APP_NAME + "."} />
    <SiteHeader theme="light" />
    <main className="auth-main">
      <h1>{title}</h1><p>Accede al espacio profesional. El análisis gratuito sigue disponible sin cuenta.</p>
      {!supabase ? <p role="alert">El acceso aún no está configurado. Inténtalo más tarde.</p> : null}
      {callbackError ? <p role="alert">El enlace no es válido o expiró. Solicita uno nuevo.</p> : null}
      {loading ? <p role="status">Verificando sesión…</p> : null}
      {recovery && !loading && !session ? <p role="alert">Abre el enlace de recuperación de tu correo para cambiar la contraseña.</p> : null}
      <form onSubmit={submit}>
        {mode !== 'recovery' ? <label>Correo electrónico<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label> : null}
        {mode !== 'forgot' ? <label>{recovery ? 'Nueva contraseña' : 'Contraseña'}<input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={mode === 'login' ? 1 : 8} required value={password} onChange={(event) => setPassword(event.target.value)} /></label> : null}
        {mode === 'signup' || recovery ? <small>Usa al menos 8 caracteres.</small> : null}
        {error ? <p role="alert">{error}</p> : null}
        {message ? <p role="status">{message}</p> : null}
        <button className="gradient-button" disabled={!supabase || busy || loading || (recovery && !session)}>{busy ? 'Procesando…' : mode === 'forgot' ? 'Enviar enlace' : title}</button>
      </form>
      <div className="auth-links">
        {recovery && session ? <Link to={next}>Abrir terminal</Link> : null}
        {!recovery ? ['login', 'signup', 'forgot'].filter((item) => item !== mode).map((item) => <button type="button" key={item} onClick={() => { setMode(item); setError(''); setMessage(''); setPassword('') }}>{{ login: 'Ya tengo una cuenta', signup: 'Crear cuenta', forgot: 'Olvidé mi contraseña' }[item]}</button>) : <Link to="/auth">Volver al inicio de sesión</Link>}
      </div>
    </main>
  </div>
}

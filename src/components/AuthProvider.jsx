import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AuthContext, useAuth } from '../lib/authContext.js'
import { supabase } from '../lib/supabase.js'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(Boolean(supabase))
  useEffect(() => {
    if (!supabase) return
    let active = true
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      if (active) { setSession(next); setLoading(false) }
    })
    // INITIAL_SESSION also covers refresh and email-link callbacks.
    return () => { active = false; subscription.unsubscribe() }
  }, [])
  return <AuthContext.Provider value={{ session, loading }}>{children}</AuthContext.Provider>
}

export function RequireAuth({ children }) {
  const { session, loading } = useAuth()
  const location = useLocation()
  if (loading) return <main className="auth-loading" role="status">Verificando sesión…</main>
  if (!session) return <Navigate to={`/auth?next=${encodeURIComponent(location.pathname + location.search)}`} replace />
  return <div key={session.user.id}>{children}</div>
}

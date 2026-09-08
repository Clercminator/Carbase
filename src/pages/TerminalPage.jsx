import { APP_NAME } from '../config/brand.js'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle, Bell, BookOpen, Boxes, CalendarDays, ChevronRight, CircleHelp, FileSearch,
  Gauge, Home, LogOut, Menu, Plus, Search, SlidersHorizontal, TrendingUp, X,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { TerminalContent } from '../components/terminal/TerminalViews.jsx'
import { useDemoTerminalStore } from '../lib/demoTerminalStore.js'
import { useAuth } from '../lib/authContext.js'
import { supabase } from '../lib/supabase.js'
import PageMeta from '../components/PageMeta.jsx'

const navigation = [
  { id: 'resumen', label: 'Resumen', Icon: Home },
  { id: 'tasaciones', label: 'Tasaciones', Icon: FileSearch },
  { id: 'mercado', label: 'Mercado', Icon: TrendingUp },
  { id: 'inventario', label: 'Inventario', Icon: Boxes },
  { id: 'seguimientos', label: 'Seguimientos', Icon: Gauge },
  { id: 'alertas', label: 'Alertas', Icon: Bell },
  { id: 'datos', label: 'Datos y metodología', Icon: BookOpen },
]

const attentionItems = [
  { title: 'Inventario sobre precio de mercado', detail: 'Revisa unidades cuyo precio supera el rango de mercado actual.', tone: 'blue', Icon: TrendingUp },
  { title: 'Unidades con más de 60 días', detail: 'Identifica vehículos con alta permanencia en inventario.', tone: 'amber', Icon: CalendarDays },
  { title: 'Alertas de precio', detail: 'Variaciones relevantes detectadas en el mercado.', tone: 'red', Icon: AlertTriangle },
  { title: 'Tasaciones sin resultado registrado', detail: 'Registra compra, descarte o venta para completar el historial.', tone: 'violet', Icon: FileSearch },
]

const activity = [
  ['Vehículo A', 'Tasación', 'Comprar bajo máximo', 'Alta', 'Hace 2 h', 'Completada'],
  ['Vehículo B', 'Inventario', 'Revisar precio', 'Media', 'Hace 5 h', 'Pendiente'],
  ['Vehículo C', 'Seguimiento', 'Esperar', 'Media', 'Ayer', 'Sin resultado'],
  ['Vehículo D', 'Tasación', 'Solicitar inspección', 'Alta', 'Ayer', 'Completada'],
  ['Vehículo E', 'Inventario', 'Registrar venta', 'Baja', 'Hace 2 días', 'Pendiente'],
]

export default function TerminalPage() {
  const { session } = useAuth()
  const { view = 'resumen' } = useParams()
  const activeView = navigation.some((item) => item.id === view) ? view : 'resumen'
  const [query, setQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toast, setToast] = useState('')
  const searchRef = useRef(null)
  const toastTimerRef = useRef(null)
  const { state: store, update: updateStore } = useDemoTerminalStore(session.user.id)
  const navigate = useNavigate()
  const filteredActivity = useMemo(() => activity.filter((row) => row.join(' ').toLowerCase().includes(query.toLowerCase())), [query])

  const goTo = (id) => { navigate(`/terminal/${id}`); setMobileOpen(false) }
  const notify = (message) => {
    window.clearTimeout(toastTimerRef.current)
    setToast(message)
    toastTimerRef.current = window.setTimeout(() => setToast(''), 2600)
  }

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault(); searchRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleShortcut)
    return () => { document.removeEventListener('keydown', handleShortcut); window.clearTimeout(toastTimerRef.current) }
  }, [])

  return (
    <div className="terminal-page">
      <PageMeta title={`${navigation.find((item) => item.id === activeView)?.label || 'Terminal'} — ${APP_NAME}`} description="Espacio profesional demostrativo para tasaciones, inventario, mercado, seguimientos y alertas." />
      <aside className={`terminal-sidebar${mobileOpen ? ' is-open' : ''}`}>
        <div className="terminal-brand"><Link to="/">{APP_NAME}</Link><button type="button" onClick={() => setMobileOpen(false)} aria-label="Cerrar navegación"><X /></button></div>
        <button className="terminal-org" type="button"><span>D</span><div><strong>Distribuidora demo</strong><small>Espacio profesional</small></div></button>
        <nav aria-label="Terminal profesional">
          {navigation.map(({ id, label, Icon }) => (
            <button className={activeView === id ? 'is-active' : ''} key={id} type="button" onClick={() => goTo(id)}>
              <Icon aria-hidden="true" /><span>{label}</span>{id === 'alertas' ? <i aria-hidden="true" /> : null}
            </button>
          ))}
        </nav>
        <div className="terminal-user"><span>U</span><div><strong title={session.user.email}>{session.user.email}</strong><small>Modo demostración</small></div><button type="button" aria-label="Cerrar sesión" onClick={async () => { try { const { error } = await supabase.auth.signOut({ scope: 'local' }); if (error) notify('No pudimos cerrar la sesión. Inténtalo nuevamente.') } catch { notify('No pudimos cerrar la sesión. Inténtalo nuevamente.') } }}><LogOut aria-hidden="true" /></button></div>
      </aside>

      <div className="terminal-workspace">
        <header className="terminal-topbar">
          <button className="terminal-menu" type="button" onClick={() => setMobileOpen(true)} aria-label="Abrir navegación"><Menu /></button>
          <label className="terminal-search"><Search aria-hidden="true" /><input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar vehículo, patente o publicación" /><kbd>Ctrl K</kbd></label>
          <button className="terminal-new" type="button" onClick={() => navigate('/deal-check')}><Plus aria-hidden="true" /> Nueva tasación</button>
          <Link className="terminal-help" to="/methodology" aria-label="Ayuda y metodología"><CircleHelp /></Link>
          <span className="demo-mode"><i /> Modo demostración</span>
        </header>

        {activeView === 'resumen' ? (
          <main className="terminal-main">
            <div className="terminal-content">
              <h1>Resumen</h1>
              <p>Decisiones que requieren tu atención hoy</p>
              <section className="attention-list">
                {attentionItems.map(({ title, detail, tone, Icon }) => (
                  <button key={title} type="button" onClick={() => goTo(title.includes('Inventario') || title.includes('Unidades') ? 'inventario' : title.includes('Alertas') ? 'alertas' : 'tasaciones')}><span className={`attention-icon tone-${tone}`}><Icon /></span><span><strong>{title}</strong><small>{detail}</small></span><ChevronRight /></button>
                ))}
              </section>
              <ActivityTable rows={filteredActivity} />
            </div>
            <TerminalRail />
          </main>
        ) : <TerminalContent view={activeView} query={query} store={store} updateStore={updateStore} onNewAppraisal={() => navigate('/deal-check')} notify={notify} />}
        <footer className="terminal-footer"><ShieldNote /> Las tasaciones profesionales utilizan el mismo motor y metodología del producto gratuito. <Link to="/methodology">Conocer más</Link></footer>
        <div className={`terminal-toast${toast ? ' is-visible' : ''}`} role="status"><CheckToast />{toast}</div>
      </div>
    </div>
  )
}

function ActivityTable({ rows }) {
  return (
    <section className="terminal-table-section">
      <div className="terminal-section-heading"><h2>Actividad reciente</h2><button type="button"><SlidersHorizontal /> Filtrar</button></div>
      <div className="terminal-table-shell"><table><thead><tr><th>Vehículo</th><th>Tipo</th><th>Recomendación</th><th>Confianza</th><th>Actualizado</th><th>Estado</th></tr></thead>
        <tbody>{rows.length ? rows.map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={cell}><span className={index === 5 ? `table-status status-${cell.toLowerCase().replace(' ', '-')}` : ''}>{cell}</span></td>)}</tr>) : <tr><td className="empty-table" colSpan="6">No encontramos resultados para esa búsqueda.</td></tr>}</tbody>
      </table></div>
    </section>
  )
}

function TerminalRail() {
  return (
    <aside className="terminal-rail">
      <section><h2>Cobertura de datos</h2><dl><div><dt>Última actualización</dt><dd>Hace 6 horas</dd></div><div><dt>Observaciones comparables</dt><dd>24 demostrativas</dd></div><div><dt>Regiones con cobertura</dt><dd>Por confirmar</dd></div></dl><Link to="/methodology">Ver metodología <ChevronRight /></Link></section>
      <section><h2>Liquidez de mercado <small>30 días</small></h2><div className="liquidity-chart" aria-label="Gráfico demostrativo de liquidez"><svg viewBox="0 0 300 130"><path d="M8 91 C35 38 58 62 80 72 S122 108 148 68 S184 44 205 72 S247 96 292 48" /><line x1="8" y1="69" x2="292" y2="69" /></svg></div><div className="liquidity-labels"><span>Baja</span><span>Normal</span><span>Alta</span></div></section>
      <section><h2>Calidad del conjunto</h2><p>Los valores son ilustrativos hasta conectar fuentes licenciadas y resultados reales.</p><Link to="/methodology">Nuestro enfoque <ChevronRight /></Link></section>
    </aside>
  )
}

function ShieldNote() {
  return <span className="shield-note" aria-hidden="true">✓</span>
}

function CheckToast() {
  return <span aria-hidden="true">✓</span>
}

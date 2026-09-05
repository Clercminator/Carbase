import { useEffect, useId, useRef, useState } from 'react'
import { Globe2, Menu, Search, UserRound, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { saveDemoAnalysis } from '../lib/demoAnalysis.js'

const navItems = [
  { label: 'Análisis gratuito', href: '/deal-check' },
  { label: 'Mercado', href: '/terminal/mercado' },
  { label: 'Datos', href: '/methodology' },
  { label: 'Distribuidores', href: '/terminal' },
  { label: 'Metodología', href: '/methodology' },
]

export default function SiteHeader({ theme = 'dark', ctaLabel = 'Analizar gratis', ctaHref = '/deal-check' }) {
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const searchRef = useRef(null)
  const menuId = useId()

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleShortcut)
    return () => document.removeEventListener('keydown', handleShortcut)
  }, [])

  const submitSearch = (event) => {
    event.preventDefault()
    const value = query.trim()
    if (!value) { searchRef.current?.focus(); return }
    const analysis = saveDemoAnalysis({ method: 'search', description: value })
    navigate(`/analysis/${analysis.analysisId}`, { state: { vehicle: value, processing: true } })
    setMenuOpen(false)
  }

  return (
    <header className={`site-header site-header--${theme}`}>
      <div className="header-inner">
        <div className="header-start">
          <Link className="wordmark" to="/" aria-label="AUTOINDEX, inicio">AUTOINDEX</Link>
          <form className="global-search" onSubmit={submitSearch} role="search">
            <Search aria-hidden="true" />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Buscar en AUTOINDEX"
              placeholder="Buscar (Ctrl+K)"
            />
          </form>
        </div>

        <nav className="desktop-nav" aria-label="Navegación principal">
          {navItems.map((item) => <Link key={item.label} to={item.href}>{item.label}</Link>)}
        </nav>

        <div className="header-actions">
          <button className="language-button" type="button" aria-label="Idioma: español"><Globe2 /><span>ES</span></button>
          <Link className="account-button" to="/terminal" aria-label="Abrir terminal profesional"><UserRound /></Link>
          <Link className="gradient-button" to={ctaHref}>{ctaLabel}</Link>
          <button
            className="menu-button"
            type="button"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((current) => !current)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <nav id={menuId} className={`mobile-nav${menuOpen ? ' is-open' : ''}`} aria-label="Navegación móvil">
        {navItems.map((item) => <Link key={item.label} to={item.href} onClick={() => setMenuOpen(false)}>{item.label}</Link>)}
      </nav>
    </header>
  )
}

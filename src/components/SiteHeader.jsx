import { useEffect, useId, useRef, useState } from 'react'
import { Globe2, Menu, Search, UserRound, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const navItems = [
  { label: 'Productos', href: '/#search' },
  { label: 'Mercado', href: '/analysis' },
  { label: 'Datos', href: '/analysis#summary' },
  { label: 'Distribuidores', href: '/#search' },
  { label: 'Más', href: '/analysis#comparables' },
]

export default function SiteHeader({ theme = 'dark' }) {
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
    navigate('/analysis', { state: { vehicle: query.trim() || 'Vehículo seleccionado' } })
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
          <button className="account-button" type="button" aria-label="Abrir cuenta"><UserRound /></button>
          <Link className="gradient-button" to="/#search">Comenzar gratis</Link>
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

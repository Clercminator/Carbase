import { APP_NAME } from '../config/brand.js'
import { useId, useState } from 'react'
import { Globe2, Menu, UserRound, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/authContext.js'

const navItems = [
  { label: 'Mercado', href: '/terminal/mercado' },
  { label: 'Distribuidores', href: '/terminal/inventario' },
  { label: 'Metodología', href: '/methodology' },
  { label: 'Planes', href: '/pricing' },
]

export default function SiteHeader({ theme = 'dark', ctaLabel = 'Analizar gratis', ctaHref = '/deal-check' }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuId = useId()
  const { session } = useAuth()

  return (
    <header className={`site-header site-header--${theme}`}>
      <div className="header-inner">
        <div className="header-start">
          <Link className="wordmark" to="/" aria-label={APP_NAME + ", inicio"}>{APP_NAME}</Link>

        </div>

        <nav className="desktop-nav" aria-label="Navegación principal">
          <Link className="gradient-button" to={ctaHref}>{ctaLabel}</Link>
          {navItems.map((item) => <Link key={item.label} to={item.href}>{item.label}</Link>)}
        </nav>

        <div className="header-actions">
          <button className="language-button" type="button" aria-label="Idioma: español"><Globe2 /><span>ES</span></button>
          <Link className="account-button" to={session ? "/account" : "/auth"} aria-label={session ? 'Mi cuenta' : 'Iniciar sesión'}><UserRound /></Link>
          <Link className="gradient-button mobile-cta" to={ctaHref}>{ctaLabel}</Link>
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

import { APP_NAME } from '../config/brand.js'
import { ArrowLeft, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta.jsx'
import SiteHeader from '../components/SiteHeader.jsx'

export default function NotFoundPage() {
  return <div className="not-found-page"><PageMeta title={"Página no encontrada — " + APP_NAME} /><SiteHeader theme="light" /><main className="not-found-main"><Search /><span>404</span><h1>No encontramos esta página</h1><p>El enlace puede estar incompleto o la vista puede haber cambiado.</p><Link to="/"><ArrowLeft /> Volver al inicio</Link></main></div>
}

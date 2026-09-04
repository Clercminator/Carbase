import { Check, ChevronDown, ChevronLeft, ChevronRight, Copy, Info, Search, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader.jsx'
import ComparablesTable from '../components/analysis/ComparablesTable.jsx'
import DealScore from '../components/analysis/DealScore.jsx'
import PriceCard from '../components/analysis/PriceCard.jsx'
import SummaryCard from '../components/analysis/SummaryCard.jsx'
import { describeAnalysisInput, loadDemoAnalysis } from '../lib/demoAnalysis.js'

export default function AnalysisPage() {
  const { state } = useLocation()
  const [copied, setCopied] = useState(false)
  const stored = loadDemoAnalysis()
  const metadata = state ? [state?.vehicle || 'Vehículo seleccionado', state?.version || 'Versión', state?.region || 'Región', state?.mileage || 'Kilometraje'] : describeAnalysisInput(stored)

  const share = async () => {
    const url = `${window.location.origin}/analysis/demo-evaluacion`
    try {
      if (navigator.share) await navigator.share({ title: 'Análisis AUTOINDEX', url })
      else await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="analysis-page">
      <SiteHeader theme="light" />
      <main className="analysis-main content-container">
        <div className="analysis-topline"><Link className="back-link" to="/deal-check"><ChevronLeft aria-hidden="true" /> Nueva búsqueda</Link><div className="analysis-actions"><span className="demo-chip">Datos de demostración</span><button type="button" onClick={share}>{copied ? <Check /> : <Copy />}{copied ? 'Enlace copiado' : 'Compartir análisis'}</button></div></div>
        <h1>Resultado del análisis <ChevronRight aria-hidden="true" /></h1>
        <p className="analysis-metadata">{metadata.join(' · ')}</p>
        <div className="estimate-notice"><Info aria-hidden="true" /><span><strong>Estimación, no inspección.</strong> Los datos y valores de esta demostración son ilustrativos.</span></div>
        <div className="analysis-grid"><PriceCard /><SummaryCard /></div>
        <DealScore />
        <ExplanationSection />
        <ComparablesTable />
        <AnalysisDisclosures />
      </main>
    </div>
  )
}

const explanationRows = [
  ['Comparables utilizados', '24 observaciones comparables'],
  ['Criterios de selección', 'Segmento, configuración, ubicación, kilometraje y recencia'],
  ['Antigüedad de los datos', 'Actualizado hace 6 horas'],
  ['Ajuste por kilometraje', '−1,8% respecto de la muestra comparable'],
  ['Ajuste por región', 'Cobertura principal en Región Metropolitana'],
  ['Ajuste por versión y condición', 'Condición pendiente de inspección'],
]

function ExplanationSection() {
  const [open, setOpen] = useState(false)
  return (
    <section className="explanation-section" id="explanation">
      <h2>Cómo llegamos a este resultado</h2>
      <p>La recomendación se construye a partir de comparables y ajustes visibles. Estos valores son demostrativos hasta conectar el motor de datos.</p>
      <div className="explanation-grid">
        <div className="explanation-rows">
          {explanationRows.map(([label, value]) => <div key={label}><strong>{label}</strong><span>{value}</span></div>)}
        </div>
        <aside className="confidence-panel">
          <ShieldCheck aria-hidden="true" /><div><h3>Por qué la confianza es alta</h3><p>La demostración supone observaciones recientes, consistentes y suficientemente similares.</p><ul><li>24 comparables válidos</li><li>Baja dispersión de precios</li><li>Cobertura geográfica adecuada</li></ul><div className="confidence-meter"><span style={{ width: '86%' }} /><strong>Alta · 86%</strong></div></div>
        </aside>
      </div>
      <button className={`change-factors${open ? ' is-open' : ''}`} type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open}>
        <span><strong>Qué podría cambiar esta recomendación</strong><small>{open ? 'Una inspección, historial incompleto, equipamiento no identificado o cambios recientes de mercado.' : 'Revisa los factores que podrían modificar el valor estimado.'}</small></span><ChevronDown aria-hidden="true" />
      </button>
    </section>
  )
}

function AnalysisDisclosures() {
  return (
    <footer className="analysis-disclosures">
      {[
        ['Metodología', 'Criterios y ajustes visibles'], ['Limitaciones', 'No reemplaza una inspección'], ['Fuentes y licencias', 'Procedencia por confirmar'], ['Tratamiento de datos', 'Privacidad y retención'], ['Relaciones comerciales', 'Independencia declarada'],
      ].map(([title, copy]) => <Link to="/methodology" key={title}><strong>{title}</strong><small>{copy}</small></Link>)}
      <Link className="new-search-footer" to="/deal-check"><Search /> Nueva búsqueda</Link>
    </footer>
  )
}

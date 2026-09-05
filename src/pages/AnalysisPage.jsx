import { AlertTriangle, Check, ChevronDown, ChevronLeft, ChevronRight, Clock3, Copy, Info, RefreshCcw, Search, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import PageMeta from '../components/PageMeta.jsx'
import SiteHeader from '../components/SiteHeader.jsx'
import AnalysisNextActions from '../components/analysis/AnalysisNextActions.jsx'
import ComparablesTable from '../components/analysis/ComparablesTable.jsx'
import DealScore from '../components/analysis/DealScore.jsx'
import PriceCard from '../components/analysis/PriceCard.jsx'
import SummaryCard from '../components/analysis/SummaryCard.jsx'
import { describeAnalysisInput, loadDemoAnalysis, resolveDemoAnalysis } from '../lib/demoAnalysis.js'

export default function AnalysisPage() {
  const { state } = useLocation()
  const { analysisId = 'demo-evaluacion' } = useParams()
  const [searchParams] = useSearchParams()
  const [copied, setCopied] = useState(false)
  const [processing, setProcessing] = useState(Boolean(state?.processing))
  const stored = loadDemoAnalysis()
  const scenario = resolveDemoAnalysis(stored, searchParams.get('scenario'))
  const metadata = state?.vehicle ? [state.vehicle, state.version || 'Versión por confirmar', state.region || 'Región por confirmar', state.mileage || 'Kilometraje por confirmar'] : describeAnalysisInput(stored)

  useEffect(() => {
    if (!processing) return undefined
    const timer = window.setTimeout(() => setProcessing(false), 900)
    return () => window.clearTimeout(timer)
  }, [processing])

  const share = async () => {
    const url = `${window.location.origin}/analysis/${analysisId}?scenario=${scenario.id}`
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
      <PageMeta title={`${processing ? 'Preparando análisis' : scenario.title || 'Resultado del análisis'} — AUTOINDEX`} />
      <SiteHeader theme="light" />
      <main className="analysis-main content-container">
        {processing ? <AnalysisState icon={Clock3} label="Análisis en curso" title="Estamos preparando una recomendación explicable" copy="Identificamos el vehículo, revisamos la cobertura y seleccionamos comparables antes de mostrar una estimación." processing /> : null}
        {!processing && scenario.status !== 'estimated' ? <AnalysisState icon={scenario.status === 'error' ? RefreshCcw : AlertTriangle} label={scenario.label} title={scenario.title} copy={scenario.copy} /> : null}
        {!processing && scenario.status === 'estimated' ? <>
        <div className="analysis-topline"><Link className="back-link" to="/deal-check"><ChevronLeft aria-hidden="true" /> Nueva búsqueda</Link><div className="analysis-actions"><span className="demo-chip">Datos de demostración</span><button type="button" onClick={share}>{copied ? <Check /> : <Copy />}{copied ? 'Enlace copiado' : 'Compartir análisis'}</button></div></div>
        <h1>Resultado del análisis <ChevronRight aria-hidden="true" /></h1>
        <p className="analysis-metadata">{metadata.join(' · ')}</p>
        <div className="estimate-notice"><Info aria-hidden="true" /><span><strong>{scenario.label}, no inspección.</strong> {scenario.notice}</span></div>
        <div className="analysis-grid"><PriceCard scenario={scenario} /><SummaryCard scenario={scenario} /></div>
        <DealScore scenario={scenario} />
        <ExplanationSection scenario={scenario} />
        <ComparablesTable scenario={scenario} />
        <AnalysisNextActions analysisId={analysisId} scenario={scenario} />
        <AnalysisDisclosures />
        </> : null}
      </main>
    </div>
  )
}

function ExplanationSection({ scenario }) {
  const [open, setOpen] = useState(false)
  const explanationRows = [
    ['Comparables utilizados', `${scenario.confidence.sampleSize} observaciones comparables`],
    ['Criterios de selección', 'Segmento, configuración, ubicación, kilometraje y recencia'],
    ['Antigüedad de los datos', scenario.confidence.freshness],
    ['Ajuste por kilometraje', scenario.adjustments.mileage],
    ['Ajuste por región', scenario.adjustments.region],
    ['Ajuste por versión y condición', scenario.adjustments.version],
  ]
  return (
    <section className="explanation-section" id="explanation">
      <h2>Cómo llegamos a este resultado</h2>
      <p>La recomendación se construye a partir de comparables y ajustes visibles. Estos valores son demostrativos hasta conectar el motor de datos.</p>
      <div className="explanation-grid">
        <div className="explanation-rows">
          {explanationRows.map(([label, value]) => <div key={label}><strong>{label}</strong><span>{value}</span></div>)}
        </div>
        <aside className={`confidence-panel${scenario.confidence.level === 'Alta' ? '' : ' is-limited'}`}>
          <ShieldCheck aria-hidden="true" /><div><h3>Por qué la confianza es {scenario.confidence.level.toLowerCase()}</h3><p>El nivel combina cantidad, similitud, recencia, dispersión y cobertura de las observaciones.</p><ul>{scenario.confidence.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul><div className="confidence-meter"><span style={{ width: `${scenario.confidence.score}%` }} /><strong>{scenario.confidence.level} · {scenario.confidence.score}%</strong></div></div>
        </aside>
      </div>
      <button className={`change-factors${open ? ' is-open' : ''}`} type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open}>
        <span><strong>Qué podría cambiar esta recomendación</strong><small>{open ? scenario.changeFactors : 'Revisa los factores que podrían modificar el valor estimado.'}</small></span><ChevronDown aria-hidden="true" />
      </button>
    </section>
  )
}

function AnalysisDisclosures() {
  return (
    <footer className="analysis-disclosures">
      {[
        ['Metodología', 'Criterios y ajustes visibles', '/methodology'], ['Limitaciones', 'No reemplaza una inspección', '/methodology'], ['Fuentes y licencias', 'Procedencia por confirmar', '/methodology'], ['Tratamiento de datos', 'Privacidad y retención', '/privacy'], ['Relaciones comerciales', 'Independencia declarada', '/terms'],
      ].map(([title, copy, to]) => <Link to={to} key={title}><strong>{title}</strong><small>{copy}</small></Link>)}
      <Link className="new-search-footer" to="/deal-check"><Search /> Nueva búsqueda</Link>
    </footer>
  )
}

function AnalysisState({ icon: Icon, label, title, copy, processing: isProcessing = false }) {
  return <section className={`analysis-state-card${isProcessing ? ' is-processing' : ''}`} aria-live="polite" aria-busy={isProcessing}><span className="analysis-state-icon"><Icon /></span><span className="demo-chip">{label}</span><h1>{title}</h1><p>{copy}</p>{isProcessing ? <div className="analysis-progress"><span /></div> : <div className="analysis-state-actions"><Link className="next-action-primary" to="/deal-check">Intentar nuevamente</Link><Link to="/methodology">Revisar metodología</Link></div>}</section>
}

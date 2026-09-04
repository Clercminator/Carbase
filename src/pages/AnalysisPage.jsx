import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader.jsx'
import ComparablesTable from '../components/analysis/ComparablesTable.jsx'
import DealScore from '../components/analysis/DealScore.jsx'
import PriceCard from '../components/analysis/PriceCard.jsx'
import SummaryCard from '../components/analysis/SummaryCard.jsx'

export default function AnalysisPage() {
  const { state } = useLocation()
  const metadata = [
    state?.vehicle || 'Vehículo seleccionado',
    state?.version || 'Versión',
    state?.region || 'Región',
    state?.mileage || 'Kilometraje',
  ]

  return (
    <div className="analysis-page">
      <SiteHeader theme="light" />
      <main className="analysis-main content-container">
        <Link className="back-link" to="/#search"><ChevronLeft aria-hidden="true" /> Nueva búsqueda</Link>
        <h1>Resultado del análisis <ChevronRight aria-hidden="true" /></h1>
        <p className="analysis-metadata">{metadata.join(' · ')}</p>
        <div className="analysis-grid"><PriceCard /><SummaryCard /></div>
        <DealScore />
        <ComparablesTable />
      </main>
    </div>
  )
}

import { Tag } from 'lucide-react'
import PriceChart from './PriceChart.jsx'

export default function PriceCard() {
  return (
    <article className="analysis-card price-card">
      <div className="price-card-heading">
        <span className="round-badge"><Tag aria-hidden="true" /></span>
        <div>
          <div className="price-eyeline">Rango de precio justo estimado <span>ESTIMADO</span></div>
          <div className="price-range">$17,4M – $18,1M</div>
          <div className="price-delta">+$800 mil sobre mercado</div>
        </div>
      </div>
      <PriceChart />
    </article>
  )
}

import { Tag } from 'lucide-react'
import PriceChart from './PriceChart.jsx'

export default function PriceCard({ scenario }) {
  return (
    <article className="analysis-card price-card">
      <div className="price-card-heading">
        <span className="round-badge"><Tag aria-hidden="true" /></span>
        <div>
          <div className="price-eyeline">Rango de precio justo estimado <span>ESTIMADO</span></div>
          <div className="price-range">{scenario.price.range}</div>
          <div className="price-delta">{scenario.price.delta}</div>
        </div>
      </div>
      <PriceChart />
    </article>
  )
}

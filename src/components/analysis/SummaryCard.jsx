import { ChevronRight } from 'lucide-react'
import { summaryRows } from '../../data/sampleData.js'

export default function SummaryCard({ scenario }) {
  const values = [
    [scenario.price.published, scenario.price.published === 'Por confirmar' ? 'Pendiente' : '+4,7%'],
    [scenario.price.difference, scenario.price.difference === 'No calculada' ? 'Pendiente' : 'vs. mediana'],
    [scenario.price.maximum, 'Referencia'],
    [scenario.liquidity.value, scenario.liquidity.detail],
    [scenario.liquidity.days, scenario.liquidity.daysDetail],
    [scenario.confidence.level, `${scenario.confidence.score}/100`],
  ]
  return (
    <aside className="analysis-card summary-card" id="summary">
      <h2>Resumen del análisis</h2>
      <div className="summary-list">
        {summaryRows.map(({ label, code, tone, Icon }, index) => (
          <div className="summary-row" key={label}>
            <span className={`summary-icon tone-${tone}`}><Icon aria-hidden="true" /></span>
            <span className="summary-copy"><strong>{label}</strong><small>{code}</small></span>
            <span className="summary-value"><strong>{values[index][0]}</strong><small className={tone !== 'blue' || label.includes('Días') ? 'positive' : ''}>{values[index][1]}</small></span>
          </div>
        ))}
      </div>
      <a className="analysis-link" href="#deal-score">Ver análisis completo <ChevronRight aria-hidden="true" /></a>
    </aside>
  )
}

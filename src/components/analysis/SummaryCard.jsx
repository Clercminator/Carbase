import { ChevronRight } from 'lucide-react'
import { summaryRows } from '../../data/sampleData.js'

export default function SummaryCard() {
  return (
    <aside className="analysis-card summary-card" id="summary">
      <h2>Resumen del análisis</h2>
      <div className="summary-list">
        {summaryRows.map(({ label, code, value, detail, tone, Icon }) => (
          <div className="summary-row" key={label}>
            <span className={`summary-icon tone-${tone}`}><Icon aria-hidden="true" /></span>
            <span className="summary-copy"><strong>{label}</strong><small>{code}</small></span>
            <span className="summary-value"><strong>{value}</strong><small className={tone !== 'blue' || label.includes('Días') ? 'positive' : ''}>{detail}</small></span>
          </div>
        ))}
      </div>
      <a className="analysis-link" href="#deal-score">Ver análisis completo <ChevronRight aria-hidden="true" /></a>
    </aside>
  )
}

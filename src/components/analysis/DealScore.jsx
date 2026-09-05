import { scoreRows } from '../../data/sampleData.js'

export default function DealScore({ scenario }) {
  const values = [scenario.score.price, scenario.score.mileage, scenario.score.liquidity, scenario.score.reliability, scenario.score.confidence]
  return (
    <article className="analysis-card deal-score-card" id="deal-score">
      <div className="deal-score-body">
        <div className="gauge-block">
          <div className="score-gauge">
            <svg viewBox="0 0 120 120" aria-hidden="true">
              <circle className="gauge-track" cx="60" cy="60" r="50" pathLength="100" />
              <circle className="gauge-value" cx="60" cy="60" r="50" pathLength="100" style={{ strokeDasharray: `${scenario.score.total} 100` }} />
            </svg>
            <span className="gauge-number"><strong>{scenario.score.total}</strong><small>/100</small></span>
          </div>
          <strong className="gauge-label">Puntaje de compra</strong>
        </div>

        <div className="score-breakdown">
          <div className="score-status"><span>{scenario.score.status}</span></div>
          {scoreRows.map(({ label, tone }, index) => (
            <div className="score-row" key={label}>
              <span>{label}</span>
              <span className="score-track"><span className={`score-fill tone-${tone}`} style={{ width: `${values[index]}%` }} /></span>
              <strong className={`tone-text-${tone}`}>{values[index]}/100</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="recommendation-strip">
        <strong>Nuestro precio máximo recomendado antes de inspección</strong>
        <span>{scenario.price.maximum}</span>
      </div>
    </article>
  )
}

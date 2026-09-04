import { scoreRows } from '../../data/sampleData.js'

export default function DealScore() {
  return (
    <article className="analysis-card deal-score-card" id="deal-score">
      <div className="deal-score-body">
        <div className="gauge-block">
          <div className="score-gauge">
            <svg viewBox="0 0 120 120" aria-hidden="true">
              <circle className="gauge-track" cx="60" cy="60" r="50" pathLength="100" />
              <circle className="gauge-value" cx="60" cy="60" r="50" pathLength="100" />
            </svg>
            <span className="gauge-number"><strong>61</strong><small>/100</small></span>
          </div>
          <strong className="gauge-label">Puntaje de compra</strong>
        </div>

        <div className="score-breakdown">
          <div className="score-status"><span>Caro</span></div>
          {scoreRows.map(({ label, value, tone }) => (
            <div className="score-row" key={label}>
              <span>{label}</span>
              <span className="score-track"><span className={`score-fill tone-${tone}`} style={{ width: `${value}%` }} /></span>
              <strong className={`tone-text-${tone}`}>{value}/100</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="recommendation-strip">
        <strong>Nuestro precio máximo recomendado antes de inspección</strong>
        <span>$17.900.000</span>
      </div>
    </article>
  )
}

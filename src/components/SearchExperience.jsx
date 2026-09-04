import { useNavigate } from 'react-router-dom'
import { quickActions } from '../data/sampleData.js'
import DealCheckForm from './DealCheckForm.jsx'
import TrustBand from './TrustBand.jsx'

const actionDestinations = [
  '/deal-check', '/terminal/mercado', '/deal-check', '/terminal/tasaciones',
  '/terminal/seguimientos', '/terminal/inventario', '/methodology',
]

export default function SearchExperience() {
  const navigate = useNavigate()

  return (
    <section className="search-section" id="search">
      <div className="content-container">
        <h2 className="quick-heading">¿Qué quieres hacer?</h2>
        <div className="quick-actions" role="list" aria-label="Acciones rápidas">
          {quickActions.map(({ label, Icon }, index) => (
            <button
              className={`quick-action${index === 0 ? ' is-active' : ''}`}
              key={label}
              type="button"
              role="listitem"
              onClick={() => navigate(actionDestinations[index])}
            >
              <span className="quick-action-icon"><Icon aria-hidden="true" /></span>
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="landing-deal-check">
          <div className="landing-deal-copy">
            <span>Análisis gratuito</span>
            <h2>¿Estás pagando de más?</h2>
            <p>Ingresa el vehículo como prefieras. Te mostraremos una estimación explicada y el precio máximo recomendado.</p>
          </div>
          <DealCheckForm compact />
        </div>
        <TrustBand compact />
      </div>
    </section>
  )
}

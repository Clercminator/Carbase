import { Database, Globe2, Scale, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

const trustItems = [
  { Icon: Database, title: 'Datos actualizados', detail: 'La antigüedad se muestra en cada análisis.' },
  { Icon: Globe2, title: 'Cobertura geográfica', detail: 'Resultados según disponibilidad regional.' },
  { Icon: ShieldCheck, title: 'Metodología transparente', detail: 'Criterios, ajustes y confianza explicados.' },
]

export default function TrustBand({ compact = false }) {
  return (
    <section className={`trust-band${compact ? ' trust-band--compact' : ''}`} aria-label="Confianza y metodología">
      {trustItems.map(({ Icon, title, detail }) => (
        <div className="trust-item" key={title}>
          <Icon aria-hidden="true" />
          <span><strong>{title}</strong><small>{detail}</small></span>
        </div>
      ))}
      <Link className="trust-link" to="/methodology"><Scale aria-hidden="true" /> Cómo calculamos los resultados</Link>
    </section>
  )
}

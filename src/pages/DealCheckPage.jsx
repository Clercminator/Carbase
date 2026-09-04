import { BarChart3, CircleDollarSign, ListChecks, ShieldCheck } from 'lucide-react'
import DealCheckForm from '../components/DealCheckForm.jsx'
import SiteHeader from '../components/SiteHeader.jsx'
import TrustBand from '../components/TrustBand.jsx'

const outcomes = [
  { Icon: BarChart3, label: 'Rango de precio justo' },
  { Icon: ListChecks, label: 'Comparables explicados' },
  { Icon: ShieldCheck, label: 'Puntaje de compra' },
  { Icon: CircleDollarSign, label: 'Precio máximo recomendado' },
]

export default function DealCheckPage() {
  return (
    <div className="deal-check-page">
      <SiteHeader ctaLabel="Terminal profesional" ctaHref="/terminal" />
      <main>
        <section className="deal-check-hero">
          <div className="deal-check-container">
            <h1>Analiza cualquier auto antes de comprarlo</h1>
            <p>Conoce su precio justo, compáralo con el mercado y descubre cuánto deberías pagar.</p>
            <DealCheckForm />
            <div className="deal-outcomes" aria-label="Contenido del análisis">
              <strong>Qué recibirás</strong>
              {outcomes.map(({ Icon, label }) => <span key={label}><Icon aria-hidden="true" />{label}</span>)}
            </div>
            <TrustBand />
          </div>
        </section>

        <section className="how-it-works content-container">
          <h2>Cómo funciona</h2>
          <div className="steps-rail">
            <article><span>1</span><div><h3>Ingresa la información</h3><p>Pega un enlace, ingresa la patente o describe el vehículo con filtros.</p></div></article>
            <article><span>2</span><div><h3>Analizamos el mercado</h3><p>El futuro motor comparará observaciones normalizadas, recientes y relevantes.</p></div></article>
            <article><span>3</span><div><h3>Toma una mejor decisión</h3><p>Revisa la recomendación, su confianza, los comparables y sus limitaciones.</p></div></article>
          </div>
          <p className="demo-disclaimer"><ShieldCheck aria-hidden="true" /> Esta versión usa datos demostrativos. Ningún resultado corresponde todavía a una tasación comercial.</p>
        </section>
      </main>
    </div>
  )
}

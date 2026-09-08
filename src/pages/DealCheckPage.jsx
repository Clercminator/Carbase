import { APP_NAME } from '../config/brand.js'
import { ArrowRight, BarChart3, CircleDollarSign, ListChecks, ShieldCheck } from 'lucide-react'
import DealCheckForm from '../components/DealCheckForm.jsx'
import PageMeta from '../components/PageMeta.jsx'
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
      <PageMeta title={"Análisis gratuito — " + APP_NAME} description="Analiza una publicación, patente o descripción de vehículo sin crear una cuenta." />
      <SiteHeader ctaLabel="Terminal profesional" ctaHref="/terminal" />
      <main>
        <section className="deal-check-hero">
          <div className="deal-check-container">
            <h1>Analiza cualquier auto antes de comprarlo</h1>
            <p>Conoce su precio justo, compáralo con el mercado y descubre cuánto deberías pagar.</p>
            <section className="how-it-works" aria-labelledby="how-it-works-title">
              <h2 id="how-it-works-title">Cómo funciona</h2>
              <div className="steps-rail">
                <article><span>1</span><div><h3>Ingresa la información</h3><p>Pega un enlace, ingresa la patente o describe el vehículo con filtros.</p></div><ArrowRight className="step-arrow" aria-hidden="true" /></article>
                <article><span>2</span><div><h3>Analizamos el mercado</h3><p>El futuro motor comparará observaciones normalizadas, recientes y relevantes.</p></div><ArrowRight className="step-arrow" aria-hidden="true" /></article>
                <article><span>3</span><div><h3>Toma una mejor decisión</h3><p>Revisa la recomendación, su confianza, los comparables y sus limitaciones.</p></div></article>
              </div>
            </section>
            <DealCheckForm />
            <div className="deal-outcomes" aria-label="Contenido del análisis">
              <strong>Qué recibirás</strong>
              {outcomes.map(({ Icon, label }) => <span key={label}><Icon aria-hidden="true" />{label}</span>)}
            </div>
            <TrustBand />
          </div>
        </section>
      </main>
    </div>
  )
}

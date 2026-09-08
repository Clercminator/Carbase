import { APP_NAME } from '../config/brand.js'
import { useState } from 'react'
import { ArrowRight, Check, CreditCard, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader.jsx'
import PageMeta from '../components/PageMeta.jsx'
import { formatPlanPrice, pricingPlans } from '../data/pricingPlans.js'

const questions = [
  ['¿Puedo contratar un plan hoy?', 'Todavía no. Puedes explorar la demostración gratis. Los precios y capacidades son una propuesta de lanzamiento; los planes pagados se habilitarán cuando los datos reales y los pagos estén disponibles. Hoy no se realiza ningún cobro.'],
  ['¿Qué cuenta como un análisis?', 'La propuesta considera un crédito por informe completo generado para un vehículo y sus condiciones. Volver a abrir ese informe no consume otro crédito. Una nueva evaluación con datos actualizados sí contará como otro análisis. Si no hay datos suficientes o falla el servicio, no se descontará el crédito.'],
  ['¿Los créditos vencen o se renuevan?', 'El informe individual y el pack tendrán 90 días de vigencia desde la compra, sin renovación automática. Los cupos mensuales se renovarán en cada ciclo y no se acumularán. Al agotar el cupo, podrás esperar al siguiente ciclo o comprar un pack; no habrá cobros por excedentes automáticos.'],
  ['¿Cómo funcionarán los pagos y la cancelación?', 'Prevemos pagos en pesos chilenos mediante Mercado Pago. Los planes mensuales tendrán renovación automática y podrás cancelar la siguiente renovación manteniendo el acceso hasta el final del período pagado. Las condiciones definitivas estarán disponibles antes de contratar.'],
  ['¿Incluye antecedentes legales o una inspección?', 'No. El análisis de mercado no incluye certificados oficiales, historial legal, multas ni revisión mecánica. Tampoco garantiza un precio de venta. Las inspecciones y los informes de terceros se contratarán por separado.'],
]

export default function PricingPage() {
  const [audience, setAudience] = useState('personal')
  return (
    <div className="pricing-page">
      <PageMeta title={"Planes y precios — " + APP_NAME} description={"Conoce los planes propuestos de " + APP_NAME + ": informes individuales, packs y terminal profesional. Precios en pesos chilenos, IVA incluido."} />
      <SiteHeader theme="light" />
      <main className="content-container pricing-main">
        <header className="pricing-intro">
          <span className="pricing-eyebrow">PLANES {APP_NAME}</span>
          <h1>Más claridad para<br />tu próxima decisión.</h1>
          <p>Un auto o todo tu inventario. Elige el análisis de mercado que acompaña tu forma de comprar y vender.</p>
        </header>
        <aside className="pricing-notice"><span className="pricing-status-dot" /><p><strong>Estamos preparando el lanzamiento.</strong> Precios propuestos, IVA incluido. Hoy puedes explorar la demo gratis; los planes pagados aún no están disponibles.</p></aside>
        <div className="pricing-switch" role="group" aria-label="Tipo de cliente">
          <button type="button" aria-pressed={audience === 'personal'} onClick={() => setAudience('personal')}>Para mí</button>
          <button type="button" aria-pressed={audience === 'business'} onClick={() => setAudience('business')}>Para mi negocio</button>
        </div>
        <section className={`pricing-grid pricing-grid--${audience}`} aria-label={audience === 'personal' ? 'Planes para personas' : 'Planes para negocios'}>
          {pricingPlans.filter((plan) => plan.audience === audience).map((plan) => (
            <article className={`pricing-card${plan.badge ? ' pricing-card--featured' : ''}`} key={plan.id}>
              <div className="pricing-card-label">{plan.badge || (plan.priceClp ? 'PRÓXIMAMENTE' : 'DEMO DISPONIBLE')}</div>
              <h2>{plan.name}</h2><p className="pricing-description">{plan.description}</p>
              <div className="pricing-price">{formatPlanPrice(plan.priceClp)}<span>CLP · {plan.period}</span></div>
              <p className="pricing-tax">{plan.priceClp ? 'IVA incluido · precio propuesto' : 'Exploración gratuita de la demostración'}</p>
              <Link className="pricing-cta" to={plan.href}>{plan.cta}<ArrowRight aria-hidden="true" size={16} /></Link>
              <p className="pricing-feature-label">{plan.priceClp ? 'AL LANZAMIENTO' : 'EN LA DEMO'}</p>
              <ul>{plan.features.map((feature) => <li key={feature}><Check aria-hidden="true" size={16} /><span>{feature}</span></li>)}</ul>
            </article>
          ))}
        </section>
        <p className="pricing-footnote">{audience === 'personal' ? 'Compra puntual, sin suscripción. El mismo nivel de detalle en el informe individual y el pack.' : 'Suscripción mensual propuesta, sin permanencia mínima. Los cupos se comparten entre los usuarios del plan. La demo requiere iniciar sesión.'}</p>
        <section className="pricing-principles" aria-label="Condiciones de los planes">
          <div><ShieldCheck aria-hidden="true" /><h2>La confianza no se cobra aparte</h2><p>Todos los análisis mostrarán su nivel de confianza y sus limitaciones. Sin datos suficientes, no se consumirá un crédito.</p></div>
          <div><CreditCard aria-hidden="true" /><h2>Pesos chilenos. Cuentas claras.</h2><p>Precios finales con IVA incluido. Mercado Pago será el primer medio de pago previsto para el lanzamiento.</p></div>
        </section>
        <section className="pricing-faq"><div><span className="pricing-eyebrow">ANTES DE ELEGIR</span><h2>Preguntas frecuentes</h2><p>Lo que necesitas saber sobre los planes propuestos.</p><Link to="/methodology">Conoce nuestra metodología <ArrowRight aria-hidden="true" size={16} /></Link></div><div>{questions.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>
        <nav className="pricing-legal" aria-label="Información legal"><Link to="/privacy">Privacidad</Link><Link to="/terms">Condiciones de la demostración</Link></nav>
      </main>
    </div>
  )
}

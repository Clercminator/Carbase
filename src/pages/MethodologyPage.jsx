import { APP_NAME } from '../config/brand.js'
import { AlertTriangle, ArrowLeft, FileCheck2, LockKeyhole, Scale } from 'lucide-react'
import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader.jsx'
import PageMeta from '../components/PageMeta.jsx'

const sections = [
  { Icon: FileCheck2, title: 'Un proceso cuidadoso', copy: 'Nuestro enfoque combina revisión de la información, comparación de vehículos similares y evaluación del contexto de mercado para ofrecer una referencia útil.' },
  { Icon: Scale, title: 'Resultados con contexto', copy: 'Cada análisis muestra una referencia de precio, su nivel de confianza y sus límites. Si la información no alcanza, lo indicamos sin presentar una estimación.' },
  { Icon: LockKeyhole, title: 'Uso responsable de la información', copy: 'El servicio se está desarrollando con foco en fuentes autorizadas y en el uso de los datos para la finalidad informada. Puedes conocer el tratamiento actual en nuestra página de privacidad.' },
  { Icon: AlertTriangle, title: 'Limitaciones', copy: 'Una estimación de mercado no reemplaza una inspección mecánica, revisión legal ni verificación presencial del vehículo.' },
]

export default function MethodologyPage() {
  return (
    <div className="methodology-page">
      <PageMeta title={"Metodología y confianza — " + APP_NAME} description="Un proceso cuidadoso, resultados con contexto y uso responsable de la información." />
      <SiteHeader theme="light" />
      <main className="methodology-main content-container">
        <Link className="back-link" to="/deal-check"><ArrowLeft aria-hidden="true" /> Volver al análisis gratuito</Link>
        <h1>Más claridad para decidir</h1>
        <p className="methodology-lead">{APP_NAME} está diseñado para ayudarte a evaluar una compra o venta con información de mercado, criterios consistentes y límites claros.</p>
        <div className="methodology-notice"><AlertTriangle aria-hidden="true" /><span><strong>Datos de demostración</strong> Las cifras visibles actualmente no representan cobertura ni precisión reales.</span></div>
        <section className="methodology-list">
          {sections.map(({ Icon, title, copy }) => (
            <article key={title}><Icon aria-hidden="true" /><div><h2>{title}</h2><p>{copy}</p></div></article>
          ))}
        </section>
        <nav className="methodology-legal-links" aria-label="Información legal"><Link to="/privacy">Privacidad y tratamiento de datos</Link><Link to="/terms">Condiciones de la demostración</Link></nav>
      </main>
    </div>
  )
}

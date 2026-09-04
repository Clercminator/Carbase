import { AlertTriangle, ArrowLeft, Database, FileCheck2, LockKeyhole, Scale, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader.jsx'

const sections = [
  { Icon: Database, title: 'Fuentes y licencias', copy: 'Cada observación deberá conservar su fuente, fecha de captura, permiso de uso y reglas de retención. Priorizaremos acuerdos directos y fuentes autorizadas.' },
  { Icon: Scale, title: 'Metodología', copy: 'La estimación distinguirá precio publicado, precio estimado de venta y precio máximo recomendado. Los criterios, ajustes y tamaño de muestra se mostrarán en cada resultado.' },
  { Icon: FileCheck2, title: 'Calidad y cobertura', copy: 'Publicaremos la antigüedad de los datos, cobertura geográfica, observaciones utilizables, valores atípicos excluidos y nivel de confianza.' },
  { Icon: AlertTriangle, title: 'Limitaciones', copy: 'Una estimación de mercado no reemplaza una inspección mecánica, revisión legal ni verificación presencial del vehículo.' },
  { Icon: LockKeyhole, title: 'Tratamiento de datos', copy: 'La arquitectura contempla consentimiento, finalidad, acceso por roles, registro de actividad, retención limitada, corrección y eliminación.' },
  { Icon: UsersRound, title: 'Relaciones comerciales', copy: 'Las relaciones con distribuidores, talleres, aseguradoras o inspectores deberán identificarse sin alterar la independencia de la recomendación.' },
]

export default function MethodologyPage() {
  return (
    <div className="methodology-page">
      <SiteHeader theme="light" />
      <main className="methodology-main content-container">
        <Link className="back-link" to="/deal-check"><ArrowLeft aria-hidden="true" /> Volver al análisis gratuito</Link>
        <h1>Confianza desde el origen del dato</h1>
        <p className="methodology-lead">AUTOINDEX está diseñado para que cada recomendación pueda revisarse, explicarse y corregirse. Esta página describe la infraestructura prevista mientras el motor de datos se encuentra en desarrollo.</p>
        <div className="methodology-notice"><AlertTriangle aria-hidden="true" /><span><strong>Datos de demostración</strong> Las cifras visibles actualmente no representan cobertura ni precisión reales.</span></div>
        <section className="methodology-list">
          {sections.map(({ Icon, title, copy }) => (
            <article key={title}><Icon aria-hidden="true" /><div><h2>{title}</h2><p>{copy}</p></div></article>
          ))}
        </section>
        <section className="legal-readiness">
          <div><span>Preparación regulatoria</span><h2>Ley 21.719</h2></div>
          <p>El diseño técnico considera desde ahora controles de privacidad y gobernanza orientados a la normativa chilena que entra en vigencia el 1 de diciembre de 2026. Esto no constituye asesoría legal.</p>
        </section>
      </main>
    </div>
  )
}

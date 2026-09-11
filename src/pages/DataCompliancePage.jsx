import { APP_NAME } from '../config/brand.js'
import { ArrowLeft, DatabaseZap } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta.jsx'
import SiteHeader from '../components/SiteHeader.jsx'

export default function DataCompliancePage() {
  return (
    <div className="legal-page">
      <PageMeta title={`Datos y cumplimiento — ${APP_NAME}`} description="Principios de gobierno, seguridad, procedencia y cumplimiento de datos de Carbase." />
      <SiteHeader theme="light" />
      <main className="legal-main content-container">
        <Link className="back-link" to="/"><ArrowLeft aria-hidden="true" /> Volver al inicio</Link>
        <div className="legal-heading"><DatabaseZap aria-hidden="true" /><div>
          <span>Gobierno de información</span>
          <h1>Datos y cumplimiento</h1>
          <p>Estos principios describen cómo construiremos un servicio trazable, seguro y compatible con obligaciones chilenas e internacionales de privacidad y datos.</p>
        </div></div>
        <section className="legal-document">
          <LegalSection title="1. Procedencia y licencias"><p>Cada fuente debe registrar procedencia, licencia o base de uso, método de recolección, fecha de observación y regla de retención. No incorporaremos publicaciones, imágenes, marcas o bases de terceros si sus condiciones no lo permiten. Los datos observados, inferidos, estimados y verificados se mantendrán diferenciados.</p></LegalSection>
          <LegalSection title="2. Minimización y finalidad"><p>Recolectaremos solo lo necesario para análisis, seguridad, soporte, facturación o cumplimiento. Patentes, VIN, contactos y datos comerciales tendrán acceso restringido, finalidad explícita, separación lógica y plazos de eliminación. No se usarán para una finalidad incompatible sin informar y obtener la autorización que corresponda.</p></LegalSection>
          <LegalSection title="3. Seguridad y segregación"><p>El terminal debe aplicar mínimo privilegio, autenticación robusta, segregación por organización, cifrado cuando corresponda, gestión de secretos, registros de actividad, respaldos controlados y revisión de proveedores. Los incidentes tendrán un proceso de contención, evaluación, documentación y notificación según la obligación aplicable.</p></LegalSection>
          <LegalSection title="4. Calidad, explicabilidad y revisión humana"><p>Los resultados deben conservar versión de fuente, metodología, modelo, fecha, comparables, confianza y limitaciones. Si no existe muestra responsable, el sistema debe informar datos insuficientes. Una recomendación no reemplaza la revisión humana ni una inspección, verificación legal o decisión crediticia.</p></LegalSection>
          <LegalSection title="5. Derechos y solicitudes"><p>El diseño contempla acceso, rectificación, actualización, eliminación, bloqueo, oposición y retiro de consentimiento cuando proceda. El responsable y el canal para ejercerlos se completarán antes del lanzamiento. La operación en Chile considerará la Ley 19.628 y la entrada en vigor de la Ley 21.719; para otras jurisdicciones se añadirán avisos, bases jurídicas y mecanismos locales.</p></LegalSection>
          <LegalSection title="6. Proveedores y transferencias internacionales"><p>Los encargados recibirán únicamente instrucciones y datos necesarios, con confidencialidad, seguridad, subcontratación controlada, devolución o eliminación y apoyo ante solicitudes. Supabase Auth es el proveedor de autenticación de la demo. Las transferencias fuera de Chile se documentarán y comunicarán con las salvaguardas aplicables.</p></LegalSection>
          <LegalSection title="7. Documentación de control"><p>El contrato de datos previsto mantiene la separación entre identidad, publicación, transacción, inspección y valoración. Antes de producción deben cerrarse el inventario de tratamientos, matriz de retención, evaluación de riesgos, acuerdos con proveedores, canal de derechos y responsable legal.</p></LegalSection>
        </section>
        <p className="legal-updated">Marco de implementación · Actualizada el 11 de septiembre de 2026</p>
      </main>
    </div>
  )
}

function LegalSection({ title, children }) {
  return <article><h2>{title}</h2>{children}</article>
}

import { APP_NAME } from '../config/brand.js'
import { ArrowLeft, LockKeyhole } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta.jsx'
import SiteHeader from '../components/SiteHeader.jsx'

export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <PageMeta title={"Privacidad y tratamiento de datos — " + APP_NAME} description="Qué información usa la demostración, para qué y dónde se conserva." />
      <SiteHeader theme="light" />
      <main className="legal-main content-container">
        <Link className="back-link" to="/deal-check"><ArrowLeft aria-hidden="true" /> Volver al análisis</Link>
        <div className="legal-heading"><LockKeyhole aria-hidden="true" /><div>
          <span>Privacidad en la demostración</span>
          <h1>Privacidad y tratamiento de datos</h1>
          <p>Queremos que sepas qué información utilizas en {APP_NAME}, para qué se necesita y dónde queda guardada. Esto describe la versión actual.</p>
        </div></div>
        <section className="legal-document">
          <LegalSection title="Tu cuenta"><p>Al registrarte o iniciar sesión, tu correo y tus credenciales se envían a Supabase Auth, el proveedor que gestiona el acceso. La sesión se conserva en este navegador. Cerrar sesión no elimina tu cuenta ni los datos de demostración guardados en el dispositivo.</p></LegalSection>
          <LegalSection id="patentes" title="Tus consultas y patentes"><p>Los enlaces, filtros y patentes ingresados en el análisis de demostración permanecen en la sesión de esta pestaña; no se envían a un servicio de análisis. La patente requiere tu autorización para usarla en esa consulta. Los enlaces para compartir no incluyen la patente ni datos de contacto.</p></LegalSection>
          <LegalSection title="Lo que guardas en el navegador"><p>Los análisis guardados y los registros del terminal permanecen en este dispositivo hasta que se eliminan los datos del sitio. El terminal separa sus registros de demostración por cuenta; los análisis guardados pertenecen al navegador. No se sincronizan con otros dispositivos. Los archivos CSV importados se leen localmente.</p></LegalSection>
          <LegalSection id="contacto" title="Solicitudes de inspección"><p>El formulario de demostración no envía ni guarda de forma persistente tu correo de contacto. Antes de habilitar una solicitud real, te informaremos quién recibe tus datos y para qué, y te pediremos autorización.</p></LegalSection>
          <LegalSection title="Al habilitar nuevos servicios"><p>La versión comercial tendrá información sobre el responsable del tratamiento, los plazos de conservación y el canal para solicitar acceso, corrección o eliminación de datos. Esos mecanismos aún no están disponibles en esta demostración.</p></LegalSection>
        </section>
        <p className="legal-updated">Versión demostrativa · Actualizada el 7 de septiembre de 2026</p>
      </main>
    </div>
  )
}

function LegalSection({ id, title, children }) {
  return <article id={id}><h2>{title}</h2>{children}</article>
}

import { APP_NAME } from '../config/brand.js'
import { ArrowLeft, LockKeyhole } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta.jsx'
import SiteHeader from '../components/SiteHeader.jsx'

export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <PageMeta title={"Política de privacidad — " + APP_NAME} description="Cómo trata Carbase la información personal y los datos de vehículos." />
      <SiteHeader theme="light" />
      <main className="legal-main content-container">
        <Link className="back-link" to="/deal-check"><ArrowLeft aria-hidden="true" /> Volver al análisis</Link>
        <div className="legal-heading"><LockKeyhole aria-hidden="true" /><div>
          <span>Información para revisión legal</span>
          <h1>Política de privacidad</h1>
          <p>Esta política explica qué información trata {APP_NAME}, con qué finalidad, durante cuánto tiempo y qué opciones tienes. Describe la demo actual y el marco previsto para el servicio comercial.</p>
        </div></div>
        <section className="legal-document">
          <LegalSection title="Responsable y alcance"><p>El responsable legal, domicilio y canal formal de solicitudes deben completarse con la razón social que opere el servicio antes de su lanzamiento. Mientras tanto, esta página funciona como información de transparencia del prototipo y no reemplaza un aviso contractual personalizado.</p></LegalSection>
          <LegalSection title="Información que tratamos"><p>Podemos tratar correo y datos de autenticación; consultas de publicaciones, filtros o patente; resultados guardados; datos técnicos mínimos del navegador; y, en el terminal, información comercial que una organización incorpore. No pedimos categorías sensibles para la demo. La patente y el VIN deben tratarse como identificadores de acceso restringido, separados y con retención definida.</p></LegalSection>
          <LegalSection id="patentes" title="Finalidades y autorización"><p>Usamos la información para autenticar, ejecutar el análisis solicitado, mostrar resultados, mantener la seguridad, medir el funcionamiento y prestar soporte. La patente requiere autorización explícita en la demo. No usamos datos para publicidad personalizada ni los vendemos. Cualquier finalidad nueva, perfilamiento relevante o comunicación comercial requerirá información y base jurídica apropiadas.</p></LegalSection>
          <LegalSection title="Almacenamiento, proveedores y transferencias"><p>La demo guarda análisis y registros localmente cuando así se indica; la autenticación utiliza Supabase Auth. Los proveedores solo deben recibir los datos necesarios bajo contrato, medidas de seguridad y obligaciones de confidencialidad. Si un proveedor procesa información fuera de Chile, se informará el país o mecanismo aplicable antes de habilitar esa función.</p></LegalSection>
          <LegalSection id="contacto" title="Conservación, seguridad y solicitudes"><p>Conservamos la información solo por el tiempo necesario para la finalidad informada y la obligación aplicable; la demo no fija todavía plazos comerciales. Aplicaremos control de acceso, cifrado cuando corresponda, segregación por organización, trazabilidad y un proceso de incidentes. Puedes solicitar acceso, rectificación, actualización, eliminación, bloqueo u oposición cuando proceda bajo la normativa aplicable, incluida la Ley 19.628 y su transición a la Ley 21.719.</p></LegalSection>
          <LegalSection title="Cookies, menores y cambios"><p>La aplicación puede usar almacenamiento local y tecnologías estrictamente necesarias para sesión y preferencias. No está dirigida a menores de edad. Publicaremos cambios materiales con una nueva fecha de vigencia y pediremos consentimiento cuando sea exigible. Consulta también <Link to="/data-compliance">Datos y cumplimiento</Link>.</p></LegalSection>
        </section>
        <p className="legal-updated">Borrador informativo para revisión legal · Actualizada el 11 de septiembre de 2026</p>
      </main>
    </div>
  )
}

function LegalSection({ id, title, children }) {
  return <article id={id}><h2>{title}</h2>{children}</article>
}

import { ArrowLeft, ExternalLink, LockKeyhole } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta.jsx'
import SiteHeader from '../components/SiteHeader.jsx'

export default function PrivacyPage() {
  return <div className="legal-page"><PageMeta title="Privacidad y tratamiento de datos — AUTOINDEX" description="Cómo AUTOINDEX diseña el tratamiento, retención y control de datos personales." /><SiteHeader theme="light" /><main className="legal-main content-container"><Link className="back-link" to="/deal-check"><ArrowLeft /> Volver al análisis</Link><div className="legal-heading"><LockKeyhole /><div><span>Borrador para revisión legal</span><h1>Privacidad y tratamiento de datos</h1><p>Esta página documenta el comportamiento de la demostración y los controles previstos. Deberá ser revisada y completada por asesoría legal antes del lanzamiento comercial.</p></div></div><section className="legal-document">
    <LegalSection title="1. Estado actual de la demostración"><p>El sitio no envía patentes, correos ni resultados a un servidor de AUTOINDEX. Las entradas del análisis se conservan temporalmente en la sesión del navegador; las acciones guardadas del terminal permanecen solo en el almacenamiento local del dispositivo hasta que la persona borra los datos del sitio.</p></LegalSection>
    <LegalSection id="patentes" title="2. Patentes e identificación del vehículo"><p>La patente se solicita para identificar el vehículo y preparar una estimación. En esta demostración requiere autorización explícita y se mantiene únicamente durante la sesión activa. La versión productiva deberá registrar la finalidad, la base de licitud, la versión del consentimiento, los accesos y el plazo de eliminación.</p></LegalSection>
    <LegalSection id="contacto" title="3. Datos de contacto"><p>El formulario demostrativo de inspección no transmite ni almacena el correo ingresado. Cuando se habilite el servicio real, se informará qué entidad recibe los datos, para qué los usa, durante cuánto tiempo los conserva y cómo retirar la autorización.</p></LegalSection>
    <LegalSection title="4. Datos profesionales"><p>Los registros de distribuidores deberán aislarse por organización y rol. Precios de adquisición, costos de preparación, ventas y resultados de inspección se tratarán como información confidencial y no se utilizarán para otra finalidad sin una base documentada.</p></LegalSection>
    <LegalSection title="5. Derechos y controles previstos"><p>La arquitectura considera mecanismos de acceso, corrección, eliminación, oposición, portabilidad cuando corresponda y trazabilidad de solicitudes. Los canales, identidad del responsable y plazos operativos se publicarán antes de recolectar datos reales.</p></LegalSection>
    <LegalSection title="6. Preparación regulatoria"><p>La Ley 21.719 fue publicada el 13 de diciembre de 2024 y sus modificaciones entran en vigencia el 1 de diciembre de 2026. AUTOINDEX está diseñando sus controles para ese régimen; esta referencia no constituye asesoría legal.</p><a href="https://www.bcn.cl/leychile/navegar?i=1209272" target="_blank" rel="noreferrer">Consultar la Ley 21.719 en la Biblioteca del Congreso Nacional <ExternalLink /></a></LegalSection>
  </section><p className="legal-updated">Versión demostrativa · Actualizada el 5 de septiembre de 2026</p></main></div>
}

function LegalSection({ id, title, children }) {
  return <article id={id}><h2>{title}</h2>{children}</article>
}

import { APP_NAME } from '../config/brand.js'
import { ArrowLeft, Scale } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta.jsx'
import SiteHeader from '../components/SiteHeader.jsx'

export default function TermsPage() {
  return <div className="legal-page"><PageMeta title={"Términos y condiciones — " + APP_NAME} description={"Reglas de uso, limitaciones y condiciones de " + APP_NAME + "."} /><SiteHeader theme="light" /><main className="legal-main content-container"><Link className="back-link" to="/"><ArrowLeft /> Volver al inicio</Link><div className="legal-heading"><Scale /><div><span>Borrador para revisión legal</span><h1>Términos y condiciones</h1><p>Estas condiciones regulan el acceso a la demostración y anticipan las reglas del servicio comercial. Deben completarse y aprobarse antes de cobrar o habilitar funciones productivas.</p></div></div><section className="legal-document">
    <LegalSection title="1. Servicio y elegibilidad"><p>{APP_NAME} ofrece herramientas de análisis de mercado para personas y organizaciones. Debes entregar información verdadera, proteger tus credenciales y tener capacidad legal para aceptar estas condiciones. El acceso puede limitarse por seguridad o mantenimiento.</p></LegalSection>
    <LegalSection title="2. Datos ilustrativos y límites"><p>Los precios, puntajes, comparables, confianza y métricas de la demo son ejemplos. Una estimación no es tasación, asesoría financiera, legal, mecánica, tributaria ni garantía de precio. Debes verificar identidad, antecedentes, condición y documentos del vehículo por medios independientes.</p></LegalSection>
    <LegalSection title="3. Uso permitido"><p>Puedes usar el servicio para evaluar operaciones legítimas y autorizadas. No puedes introducir datos de terceros sin autorización, evadir controles, extraer masivamente contenidos, infringir derechos de fuentes, probar vulnerabilidades sin permiso, ni usar resultados para discriminar, acosar o tomar decisiones automatizadas de alto impacto sin revisión humana.</p></LegalSection>
    <LegalSection title="4. Disponibilidad, terceros y responsabilidad"><p>Las funciones pueden cambiar, reiniciarse o dejar de estar disponibles. Fuentes, proveedores y enlaces de terceros tienen sus propias condiciones. En la máxima medida permitida por la ley, {APP_NAME} no responde por decisiones basadas exclusivamente en una estimación ni por datos de terceros, sin perjuicio de los derechos irrenunciables del consumidor y la responsabilidad que no pueda excluirse.</p></LegalSection>
    <LegalSection title="5. Planes, pagos y cancelación"><p>La demo no cobra. Antes de un plan pagado se informarán precio total en pesos chilenos, IVA cuando corresponda, renovación, boleta o factura, soporte, desistimiento o cancelación y reembolsos. No habrá cargos automáticos sin una autorización válida y mecanismos claros de término.</p></LegalSection>
    <LegalSection title="6. Contenido, marca y propiedad intelectual"><p>El software, la metodología, la interfaz, el contenido y la marca pertenecen a sus titulares. El acceso no transfiere propiedad. Los datos que aportes deben poder ser usados para la finalidad del servicio; conservarás los derechos que te correspondan. Consulta <Link to="/intellectual-property">Marca y propiedad intelectual</Link>.</p></LegalSection>
    <LegalSection title="7. Ley aplicable y cambios"><p>Salvo normas imperativas que dispongan otra cosa, la relación se regirá por las leyes de Chile y cualquier controversia se someterá a los tribunales competentes de Chile. Las condiciones comerciales identificarán al proveedor y su domicilio. Avisaremos cambios relevantes antes de que produzcan efectos y mantendremos la versión vigente accesible.</p></LegalSection>
  </section><p className="legal-updated">Borrador informativo para revisión legal · Actualizada el 11 de septiembre de 2026</p></main></div>
}

function LegalSection({ title, children }) {
  return <article><h2>{title}</h2>{children}</article>
}

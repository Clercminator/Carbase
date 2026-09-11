import { APP_NAME } from '../config/brand.js'
import { ArrowLeft, Copyright } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta.jsx'
import SiteHeader from '../components/SiteHeader.jsx'

export default function IntellectualPropertyPage() {
  return (
    <div className="legal-page">
      <PageMeta title={`Marca y propiedad intelectual — ${APP_NAME}`} description="Reglas de uso de la marca, software, contenido y materiales de Carbase." />
      <SiteHeader theme="light" />
      <main className="legal-main content-container">
        <Link className="back-link" to="/"><ArrowLeft aria-hidden="true" /> Volver al inicio</Link>
        <div className="legal-heading"><Copyright aria-hidden="true" /><div>
          <span>Uso de nuestros materiales</span>
          <h1>Marca y propiedad intelectual</h1>
          <p>Esta página delimita qué pertenece a {APP_NAME}, qué puede aportar un usuario y cómo deben respetarse los derechos de terceros.</p>
        </div></div>
        <section className="legal-document">
          <LegalSection title="Titularidad de Carbase"><p>Salvo indicación distinta, el nombre, logotipo, interfaz, software, código, metodología, textos, gráficos, bases estructuradas y resultados generados por el servicio pertenecen a {APP_NAME} o a sus licenciantes y están protegidos por las normas aplicables, incluida la legislación chilena de propiedad intelectual y marcas.</p></LegalSection>
          <LegalSection title="Licencia limitada de uso"><p>Mientras respetes estas condiciones, recibes una licencia limitada, personal o para tu organización, no exclusiva, no transferible y revocable para acceder al servicio. No adquieres el código, la marca, la metodología ni el derecho a copiar, vender, sublicenciar, descompilar, entrenar modelos o extraer masivamente el servicio.</p></LegalSection>
          <LegalSection title="Tus aportes y datos de terceros"><p>Conservas los derechos que tengas sobre la información que aportes. Declaras que tienes autorización para usar datos, fotografías, publicaciones, marcas, VIN, patentes y documentos de terceros. Nos concedes solo los permisos necesarios para prestar, proteger y mejorar el servicio según la finalidad informada y la política de privacidad.</p></LegalSection>
          <LegalSection title="Fuentes, comparables y contenido externo"><p>Los anuncios, imágenes, nombres comerciales y otros materiales de terceros siguen perteneciendo a sus titulares y pueden estar sujetos a términos de uso, derechos de autor, bases de datos o marcas. Los comparables no deben redistribuirse fuera de la licencia o autorización de su fuente.</p></LegalSection>
          <LegalSection title="Uso de la marca"><p>No puedes usar {APP_NAME}, sus signos, capturas o materiales para sugerir patrocinio, afiliación, certificación o recomendación sin autorización escrita. Las referencias nominativas y enlaces informativos deben ser exactos, no engañosos y no menoscabar la marca.</p></LegalSection>
          <LegalSection title="Avisos y reclamos"><p>Si crees que un contenido infringe derechos, conserva la URL, identifica el material y explica tu titularidad o autorización. El canal formal del titular se publicará antes del lanzamiento comercial. Podremos retirar o restringir material mientras investigamos, respetando los procedimientos y derechos aplicables.</p></LegalSection>
          <LegalSection title="Más información"><p>Estas reglas se leen junto con los <Link to="/terms">Términos y condiciones</Link>, la <Link to="/privacy">Política de privacidad</Link> y el marco de <Link to="/data-compliance">Datos y cumplimiento</Link>.</p></LegalSection>
        </section>
        <p className="legal-updated">Marco informativo para revisión legal · Actualizada el 11 de septiembre de 2026</p>
      </main>
    </div>
  )
}

function LegalSection({ title, children }) {
  return <article><h2>{title}</h2>{children}</article>
}

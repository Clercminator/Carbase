import { ArrowLeft, Scale } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta.jsx'
import SiteHeader from '../components/SiteHeader.jsx'

export default function TermsPage() {
  return <div className="legal-page"><PageMeta title="Condiciones de la demostración — AUTOINDEX" description="Condiciones y limitaciones de la demostración de AUTOINDEX." /><SiteHeader theme="light" /><main className="legal-main content-container"><Link className="back-link" to="/"><ArrowLeft /> Volver al inicio</Link><div className="legal-heading"><Scale /><div><span>Borrador para revisión legal</span><h1>Condiciones de la demostración</h1><p>Estas condiciones explican los límites del prototipo actual. No sustituyen las condiciones comerciales definitivas.</p></div></div><section className="legal-document">
    <LegalSection title="1. Datos ilustrativos"><p>Los precios, puntajes, comparables, niveles de confianza, alertas y métricas visibles son ejemplos. No corresponden todavía a una tasación comercial ni deben utilizarse para cerrar una compra, venta, crédito, seguro o garantía.</p></LegalSection>
    <LegalSection title="2. Alcance de una estimación"><p>Una valoración de mercado no reemplaza una inspección mecánica, una revisión legal, la validación de identidad del vehículo ni la verificación presencial de su condición.</p></LegalSection>
    <LegalSection title="3. Disponibilidad"><p>Las funciones pueden cambiar, reiniciarse o dejar de estar disponibles durante el desarrollo. Los datos guardados localmente pueden perderse al limpiar el navegador o cambiar de dispositivo.</p></LegalSection>
    <LegalSection title="4. Relaciones comerciales"><p>Cuando existan acuerdos con distribuidores, talleres, inspectores, aseguradoras u otros socios, el producto deberá identificar la relación y distinguirla de la metodología de valoración.</p></LegalSection>
    <LegalSection title="5. Uso profesional"><p>El terminal representa una futura superficie autenticada. La versión productiva exigirá controles de acceso, segregación por organización, registro de actividad y acuerdos aplicables al tratamiento de información comercial.</p></LegalSection>
  </section><p className="legal-updated">Versión demostrativa · Actualizada el 5 de septiembre de 2026</p></main></div>
}

function LegalSection({ title, children }) {
  return <article><h2>{title}</h2>{children}</article>
}

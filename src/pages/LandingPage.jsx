import SiteHeader from '../components/SiteHeader.jsx'
import VideoPlaceholder from '../components/VideoPlaceholder.jsx'
import SearchExperience from '../components/SearchExperience.jsx'

export default function LandingPage() {
  return (
    <main>
      <section className="hero" id="home">
        <SiteHeader />
        <div className="hero-content">
          <h1>Sabe qué auto comprar y cuánto pagar</h1>
          <p>Inteligencia de mercado para autos usados en Chile. Precios, comparables, demanda y rotación.</p>
          <VideoPlaceholder />
        </div>
      </section>
      <SearchExperience />
    </main>
  )
}

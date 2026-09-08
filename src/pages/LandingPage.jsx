import { APP_NAME } from '../config/brand.js'
import SiteHeader from '../components/SiteHeader.jsx'
import VideoPlaceholder from '../components/VideoPlaceholder.jsx'
import SearchExperience from '../components/SearchExperience.jsx'
import HeroCarField from '../components/HeroCarField.jsx'
import PageMeta from '../components/PageMeta.jsx'

export default function LandingPage() {
  return (
    <>
      <PageMeta title={APP_NAME + " — Inteligencia de mercado automotriz"} />
      <SiteHeader />
      <main>
        <section className="hero" id="home">
          <HeroCarField />
          <div className="hero-content">
            <h1>Encuentra el auto correcto. Paga el precio justo.</h1>
            <p>Inteligencia de mercado para autos usados en Chile. Precios, comparables, demanda y rotación.</p>
            <VideoPlaceholder />
          </div>
        </section>
        <SearchExperience />
      </main>
    </>
  )
}

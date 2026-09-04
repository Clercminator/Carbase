import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import AnalysisPage from './pages/AnalysisPage.jsx'
import LandingPage from './pages/LandingPage.jsx'

function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      requestAnimationFrame(() => document.querySelector(hash)?.scrollIntoView())
      return
    }
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname, hash])

  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </>
  )
}

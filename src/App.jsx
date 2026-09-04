import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import AnalysisPage from './pages/AnalysisPage.jsx'
import DealCheckPage from './pages/DealCheckPage.jsx'
import LandingPage from './pages/LandingPage.jsx'
import MethodologyPage from './pages/MethodologyPage.jsx'
import TerminalPage from './pages/TerminalPage.jsx'

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
        <Route path="/deal-check" element={<DealCheckPage />} />
        <Route path="/analysis/:analysisId?" element={<AnalysisPage />} />
        <Route path="/terminal/:view?" element={<TerminalPage />} />
        <Route path="/methodology" element={<MethodologyPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </>
  )
}

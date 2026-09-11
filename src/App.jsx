import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import AnalysisPage from './pages/AnalysisPage.jsx'
import DealCheckPage from './pages/DealCheckPage.jsx'
import LandingPage from './pages/LandingPage.jsx'
import MethodologyPage from './pages/MethodologyPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import PrivacyPage from './pages/PrivacyPage.jsx'
import DataCompliancePage from './pages/DataCompliancePage.jsx'
import IntellectualPropertyPage from './pages/IntellectualPropertyPage.jsx'
import TerminalPage from './pages/TerminalPage.jsx'
import TermsPage from './pages/TermsPage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import PricingPage from './pages/PricingPage.jsx'
import { RequireAuth } from './components/AuthProvider.jsx'

const CheckoutPage = lazy(() => import('./pages/CheckoutPage.jsx'))
const PurchasePage = lazy(() => import('./pages/PurchasePage.jsx'))
const AccountPage = lazy(() => import('./pages/AccountPage.jsx'))
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage.jsx'))

function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView())
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
      <Suspense fallback={<main className="auth-loading" role="status">Cargando…</main>}><Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/deal-check" element={<DealCheckPage />} />
        <Route path="/analysis/:analysisId?" element={<AnalysisPage />} />
        <Route path="/terminal/:view?" element={<RequireAuth><TerminalPage /></RequireAuth>} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/methodology" element={<MethodologyPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/purchase/:id" element={<PurchasePage />} />
        <Route path="/account" element={<RequireAuth><AccountPage /></RequireAuth>} />
        <Route path="/subscribe/pro" element={<RequireAuth><SubscriptionPage /></RequireAuth>} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/data-compliance" element={<DataCompliancePage />} />
        <Route path="/intellectual-property" element={<IntellectualPropertyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes></Suspense>
    </>
  )
}

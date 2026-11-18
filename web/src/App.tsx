import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { I18nProvider, useI18n } from './i18n/I18n.tsx'
import { ProfilesProvider } from './state/Profiles.tsx'
import { AskPage } from './pages/AskPage.tsx'
import { BirthPage } from './pages/BirthPage.tsx'
import { ChartsPage } from './pages/ChartsPage.tsx'
import { DashboardPage } from './pages/DashboardPage.tsx'
import { LandingPage } from './pages/LandingPage.tsx'
import { PricingPage } from './pages/PricingPage.tsx'
import { StatusPage } from './pages/StatusPage.tsx'

const AccountPage = lazy(() => import('./pages/AccountPage.tsx').then((module) => ({ default: module.AccountPage })))
const LoginPage = lazy(() => import('./pages/AuthPages.tsx').then((module) => ({ default: module.LoginPage })))
const SignupPage = lazy(() => import('./pages/AuthPages.tsx').then((module) => ({ default: module.SignupPage })))
const ForgotPage = lazy(() => import('./pages/AuthPages.tsx').then((module) => ({ default: module.ForgotPage })))
const ResetPage = lazy(() => import('./pages/AuthPages.tsx').then((module) => ({ default: module.ResetPage })))
const HoroscopePage = lazy(() => import('./pages/HoroscopePage.tsx').then((module) => ({ default: module.HoroscopePage })))
const KundliPage = lazy(() => import('./pages/KundliPage.tsx').then((module) => ({ default: module.KundliPage })))
const MatchPage = lazy(() => import('./pages/MatchPage.tsx').then((module) => ({ default: module.MatchPage })))
const ReportPage = lazy(() => import('./pages/ReportPage.tsx').then((module) => ({ default: module.ReportPage })))

function Routed() {
  const { t } = useI18n()
  return (
    <Suspense fallback={<p className="px-5 py-16 text-mist">{t('sanskrit')}</p>}>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/charts" element={<ChartsPage />} />
      <Route path="/birth" element={<BirthPage />} />
      <Route path="/birth/:id" element={<BirthPage />} />
      <Route path="/kundli" element={<KundliPage />} />
      <Route path="/kundli/:id" element={<KundliPage />} />
      <Route path="/report/:id" element={<ReportPage />} />
      <Route path="/ask" element={<AskPage />} />
      <Route path="/horoscope" element={<HoroscopePage />} />
      <Route path="/compatibility" element={<MatchPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot" element={<ForgotPage />} />
      <Route path="/reset" element={<ResetPage />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/privacy" element={<StatusPage eyebrow={t('sanskrit')} title={t('privacyTitle')} body={t('privacyBody')} />} />
      <Route path="/terms" element={<StatusPage eyebrow={t('sanskrit')} title={t('termsTitle')} body={t('termsBody')} />} />
    </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <ProfilesProvider>
        <BrowserRouter>
          <Routed />
        </BrowserRouter>
      </ProfilesProvider>
    </I18nProvider>
  )
}

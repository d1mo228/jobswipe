import { useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { ToastProvider } from './components/Toast'
import { AppProvider, useApp } from './context/AppContext'
import { useThemeEffect } from './hooks/useTheme'
import { useViewportHeight } from './hooks/useViewportHeight'
import { getTelegramStartParam } from './integrations/telegram/telegram'
import { storage } from './services/storage'
import ChatPage from './pages/ChatPage'
import CandidatePage from './pages/CandidatePage'
import CandidateFiltersPage from './pages/CandidateFiltersPage'
import PaymentPage from './pages/PaymentPage'
import PlansPage from './pages/PlansPage'
import SetupPage from './pages/SetupPage'
import CompanyPage from './pages/CompanyPage'
import EditProfilePage from './pages/EditProfilePage'
import FiltersPage from './pages/FiltersPage'
import HomePage from './pages/HomePage'
import JobPage from './pages/JobPage'
import MatchesPage from './pages/MatchesPage'
import MessagesPage from './pages/MessagesPage'
import NewJobPage from './pages/NewJobPage'
import OnboardingPage from './pages/OnboardingPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import WelcomePage from './pages/WelcomePage'

function Guard({ children }: { children: React.ReactNode }) {
  const { state, student, employer } = useApp()
  if (!state.onboarded || !state.role) return <Navigate to="/welcome" replace />
  // анкета → (для работодателя) выбор тарифа → платформа
  if (state.role === 'student' && student && !student.setupDone) return <Navigate to="/setup" replace />
  if (state.role === 'employer' && employer) {
    if (!employer.setupDone) return <Navigate to="/setup" replace />
    if (employer.plan === null) return <Navigate to="/plans" replace />
  }
  return <>{children}</>
}

/** Deep link из Telegram: t.me/<bot>?startapp=job_<id> открывает вакансию. */
function useStartParam() {
  const { state } = useApp()
  const nav = useNavigate()
  useEffect(() => {
    const p = getTelegramStartParam()
    if (!p?.startsWith('job_')) return
    const route = `/job/${p.slice(4)}`
    if (state.onboarded && state.role === 'student') nav(route)
    else storage.set('pendingRoute', route)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

function Routed() {
  useThemeEffect()
  useViewportHeight()
  useStartParam()
  const { state } = useApp()
  return (
    <Routes>
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/setup" element={<SetupPage />} />
      <Route path="/plans" element={<PlansPage />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route
        element={
          <Guard>
            <AppShell />
          </Guard>
        }
      >
        <Route path="/home" element={<HomePage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/chat/:id" element={<ChatPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/edit-profile" element={<EditProfilePage />} />
        <Route path="/job/:id" element={<JobPage />} />
        <Route path="/company/:id" element={<CompanyPage />} />
        <Route path="/candidate/:id" element={<CandidatePage />} />
        <Route path="/new-job" element={<NewJobPage />} />
        <Route path="/filters" element={<FiltersPage />} />
        <Route path="/candidate-filters" element={<CandidateFiltersPage />} />

        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to={state.onboarded ? '/home' : '/welcome'} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        {/* HashRouter: работает на любом статическом хостинге (в т.ч. GitHub Pages) без настройки редиректов */}
        <HashRouter>
          <Routed />
        </HashRouter>
      </ToastProvider>
    </AppProvider>
  )
}

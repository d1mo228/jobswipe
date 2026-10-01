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
  const { state } = useApp()
  return state.onboarded && state.role ? <>{children}</> : <Navigate to="/welcome" replace />
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

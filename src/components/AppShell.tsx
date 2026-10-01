import { Heart, MessageCircle, Search, Settings, UserRound } from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useBackButton, useTelegram } from '../integrations/telegram/useTelegram'
import { cx } from './ui'

const TAB_PATHS = ['/home', '/matches', '/messages', '/profile']

export function AppShell() {
  const { pathname } = useLocation()
  const nav = useNavigate()
  const { role, matches } = useApp()
  const { isTelegram } = useTelegram()
  const isTab = TAB_PATHS.includes(pathname)

  // Единая точка навигации «назад»: нативная Back Button Telegram и собственная стрелка
  // в PageHeader (скрыта в Telegram) ведут себя одинаково — не конфликтуют.
  useBackButton(!isTab, () => (window.history.state?.idx > 0 ? nav(-1) : nav('/home', { replace: true })))

  const unread = matches.filter((m) => m.unread).length
  const tabs = [
    { to: '/home', label: role === 'employer' ? 'Кандидаты' : 'Поиск', icon: Search },
    { to: '/matches', label: 'Matches', icon: Heart },
    { to: '/messages', label: 'Чаты', icon: MessageCircle, badge: unread },
    { to: '/profile', label: 'Профиль', icon: UserRound },
  ]

  return (
    <div className="mx-auto w-full max-w-5xl flex flex-col md:flex-row overflow-hidden" style={{ height: 'var(--app-height, 100dvh)' }}>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 p-5 gap-1 border-r border-line">
        <div className="flex items-center gap-2 px-3 py-4 text-xl font-extrabold tracking-tight">
          <img src="./icons/icon.svg" alt="" className="w-8 h-8" /> JobSwipe
        </div>
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              cx('flex items-center gap-3 px-3 h-12 rounded-2xl font-medium', isActive ? 'bg-accent-soft text-accent' : 'text-hint hover:bg-surface2')
            }
          >
            <t.icon size={20} />
            {t.label}
            {!!t.badge && <span className="ml-auto text-xs font-bold bg-accent text-accent-ink rounded-full px-2 py-0.5">{t.badge}</span>}
          </NavLink>
        ))}
        <div className="mt-auto">
          <NavLink to="/settings" className="flex items-center gap-3 px-3 h-12 rounded-2xl font-medium text-hint hover:bg-surface2">
            <Settings size={20} /> Настройки
          </NavLink>
        </div>
      </aside>

      <main className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden" id="scroll-root">
        <div className="mx-auto w-full max-w-xl min-h-full flex flex-col">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      {isTab && (
        <nav
          className={cx('md:hidden shrink-0 bg-surface border-t border-line pb-safe', isTelegram && 'pb-1')}
          aria-label="Основная навигация"
        >
          <ul className="grid grid-cols-4">
            {tabs.map((t) => (
              <li key={t.to}>
                <NavLink
                  to={t.to}
                  className={({ isActive }) => cx('relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium', isActive ? 'text-accent' : 'text-hint')}
                >
                  <t.icon size={22} />
                  {t.label}
                  {!!t.badge && (
                    <span className="absolute top-1 left-1/2 ml-2.5 min-w-4 h-4 px-1 rounded-full bg-accent text-accent-ink text-[10px] font-bold flex items-center justify-center">
                      {t.badge}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  )
}


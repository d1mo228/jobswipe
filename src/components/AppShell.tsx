import { Heart, LifeBuoy, MessageCircle, Search, Settings, UserRound } from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useBackButton, useTelegram } from '../integrations/telegram/useTelegram'
import { Avatar, CompanyLogo, Wordmark, cx } from './ui'

const TAB_PATHS = ['/home', '/matches', '/messages', '/profile']

export function AppShell() {
  const { pathname } = useLocation()
  const nav = useNavigate()
  const { role, matches, student, employer } = useApp()
  const { isTelegram } = useTelegram()
  const isTab = TAB_PATHS.includes(pathname)

  // Единая точка навигации «назад»: нативная Back Button Telegram и собственная стрелка
  // в PageHeader (скрыта в Telegram) ведут себя одинаково — не конфликтуют.
  useBackButton(!isTab, () => (window.history.state?.idx > 0 ? nav(-1) : nav('/home', { replace: true })))

  const unread = matches.filter((m) => m.unread).length
  // Аватарка пользователя (у работодателя — логотип компании)
  const me =
    role === 'employer' && employer
      ? { name: employer.company.name, photo: employer.company.logoUrl, color: employer.company.logoColor, isLogo: true }
      : { name: student?.profile.name ?? '', photo: student?.profile.photoUrl, color: '', isLogo: false }

  const tabs = [
    { to: '/home', label: role === 'employer' ? 'Кандидаты' : 'Поиск', icon: Search },
    { to: '/matches', label: 'Matches', icon: Heart },
    { to: '/messages', label: 'Чаты', icon: MessageCircle, badge: unread },
    { to: '/profile', label: 'Профиль', icon: UserRound, avatar: true },
  ]

  const renderIcon = (t: (typeof tabs)[number], active: boolean, size: number) => {
    if (t.avatar && me.photo) {
      return (
        <span className={cx('rounded-full p-[2px] transition', active ? 'bg-accent' : 'bg-transparent')}>
          {me.isLogo ? <CompanyLogo name={me.name} color={me.color} src={me.photo} size={size + 2} /> : <Avatar name={me.name} src={me.photo} size={size + 2} ring />}
        </span>
      )
    }
    return <t.icon size={size} strokeWidth={active ? 2.4 : 2} />
  }

  return (
    <div className="mx-auto w-full max-w-5xl flex flex-col md:flex-row overflow-hidden" style={{ height: 'var(--app-height, 100dvh)' }}>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 p-5 gap-1.5 border-r border-line/70">
        <div className="px-3 py-4"><Wordmark size={21} /></div>
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              cx('flex items-center gap-3 px-3 h-12 rounded-2xl font-semibold text-[15px] transition', isActive ? 'bg-accent-soft text-accent' : 'text-hint hover:bg-surface2 hover:text-ink')
            }
          >
            {({ isActive }) => (
              <>
                {renderIcon(t, isActive, 20)}
                {t.label}
                {!!t.badge && <span className="ml-auto text-xs font-bold bg-accent text-accent-ink rounded-full px-2 py-0.5">{t.badge}</span>}
              </>
            )}
          </NavLink>
        ))}
        <div className="mt-auto space-y-1.5">
          <NavLink to="/support" className="flex items-center gap-3 px-3 h-12 rounded-2xl font-semibold text-[15px] text-hint hover:bg-surface2 hover:text-ink">
            <LifeBuoy size={20} /> Поддержка
          </NavLink>
          <NavLink to="/settings" className="flex items-center gap-3 px-3 h-12 rounded-2xl font-semibold text-[15px] text-hint hover:bg-surface2 hover:text-ink">
            <Settings size={20} /> Настройки
          </NavLink>
        </div>
      </aside>

      <main className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden" id="scroll-root">
        <div className="mx-auto w-full max-w-xl min-h-full flex flex-col">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav: плавающая «таблетка» */}
      {isTab && (
        <nav className={cx('md:hidden shrink-0 px-4 pt-1', isTelegram ? 'pb-2' : '')} style={{ paddingBottom: `calc(var(--safe-bottom) + var(--tg-safe-bottom) + 10px)` }} aria-label="Основная навигация">
          <ul className="glass border border-line/70 rounded-[26px] shadow-card grid grid-cols-4 p-1.5">
            {tabs.map((t) => (
              <li key={t.to}>
                <NavLink to={t.to} className="relative block">
                  {({ isActive }) => (
                    <span className={cx('flex flex-col items-center justify-center gap-0.5 h-[54px] rounded-[20px] text-[11px] font-semibold transition', isActive ? 'bg-accent-soft text-accent' : 'text-hint')}>
                      {renderIcon(t, isActive, 21)}
                      {t.label}
                      {!!t.badge && (
                        <span className="absolute top-1.5 left-1/2 ml-2 min-w-4 h-4 px-1 rounded-full bg-accent text-accent-ink text-[10px] font-bold flex items-center justify-center ring-2 ring-surface">
                          {t.badge}
                        </span>
                      )}
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

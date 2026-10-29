import { Briefcase, GraduationCap, Info } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, Button } from '../components/ui'
import { useApp } from '../context/AppContext'
import { getTelegramUser } from '../integrations/telegram/telegram'
import { useTelegram } from '../integrations/telegram/useTelegram'
import { storage } from '../services/storage'
import type { Role } from '../types'

export default function OnboardingPage() {
  const nav = useNavigate()
  const { startAs } = useApp()
  const { isTelegram } = useTelegram()
  const tg = getTelegramUser()

  const [picked, setPicked] = useState<Role | null>(null)

  const choose = (role: Role, demo: boolean) => {
    startAs(role, demo)
    if (!demo) return nav('/setup', { replace: true })
    const pending = storage.get<string | null>('pendingRoute', null)
    storage.remove('pendingRoute')
    nav(role === 'student' && pending ? pending : '/home', { replace: true })
  }

  const Option = ({ role, icon, title, text }: { role: Role; icon: React.ReactNode; title: string; text: string }) => (
    <button
      onClick={() => setPicked(role)}
      className="w-full text-left bg-surface rounded-3xl p-5 shadow-soft border border-line flex items-center gap-4 active:scale-[0.98] transition hover:border-accent"
    >
      <div className="w-14 h-14 rounded-2xl bg-accent-soft text-accent flex items-center justify-center shrink-0">{icon}</div>
      <div>
        <div className="font-bold text-lg">{title}</div>
        <div className="text-sm text-hint">{text}</div>
      </div>
    </button>
  )

  return (
    <div className="mx-auto max-w-xl px-6 pt-safe pb-safe flex flex-col justify-center gap-6" style={{ minHeight: 'var(--app-height, 100dvh)' }}>
      <div className="text-center space-y-3 pt-8">
        {isTelegram && tg && (
          <div className="flex flex-col items-center gap-2 mb-2">
            <Avatar name={tg.first_name} src={tg.photo_url} size={64} />
            <p className="text-sm text-hint">Привет, {tg.first_name}! Профиль возьмём из Telegram — имя вводить не нужно.</p>
          </div>
        )}
        <h1 className="text-3xl font-extrabold">{picked ? (picked === 'student' ? 'Я ищу работу' : 'Я ищу сотрудников') : 'Кто вы?'}</h1>
      </div>

      {picked ? (
        <div className="space-y-3">
          <Button full className="h-14 text-base" onClick={() => choose(picked, false)}>Заполнить анкету</Button>
          <Button full variant="ghost" onClick={() => choose(picked, true)}>
            Посмотреть демо ({picked === 'student' ? 'Demo Student' : 'Demo Employer'})
          </Button>
          <button onClick={() => setPicked(null)} className="w-full text-sm text-hint py-2">← Назад</button>
          <p className="text-center text-xs text-hint">
            {picked === 'student' ? 'Для студентов JobSwipe бесплатен.' : 'После анкеты вы выберете тариф: Free доступен сразу и бесплатно.'}
          </p>
        </div>
      ) : (<>
      <div className="space-y-3">
        <Option role="student" icon={<GraduationCap size={28} />} title="Я ищу работу" text="Студент или выпускник — свайпай вакансии" />
        <Option role="employer" icon={<Briefcase size={28} />} title="Я ищу сотрудников" text="Компания — находи талантливых кандидатов" />
      </div>

      <p className="flex items-start gap-2 text-xs text-hint bg-surface2 rounded-2xl p-3">
        <Info size={16} className="shrink-0 mt-0.5" />
        Заполните короткую анкету или откройте демо с готовыми данными — регистрация не нужна.
      </p>
      </>)}
    </div>
  )
}

import { RefreshCw, Repeat } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Segmented } from '../components/forms'
import { Button, InfoRow, PageHeader, Section } from '../components/ui'
import { useApp } from '../context/AppContext'
import { detectAppMode, MODE_LABEL } from '../hooks/useAppMode'
import { useTelegram } from '../integrations/telegram/useTelegram'
import type { ThemeMode } from '../types'

export default function SettingsPage() {
  const nav = useNavigate()
  const { state, role, setTheme, switchRole, resetDemo } = useApp()
  const { isTelegram, user, isDemoUser } = useTelegram()
  const mode = detectAppMode()
  const other = role === 'student' ? 'employer' : 'student'

  return (
    <>
      <PageHeader title="Настройки" />
      <div className="px-4 pb-8 space-y-3">
        <Section title="Тема">
          <Segmented<ThemeMode>
            value={state.theme}
            onChange={setTheme}
            options={[
              { value: 'system', label: isTelegram ? 'Telegram' : 'Системная' },
              { value: 'light', label: 'Светлая' },
              { value: 'dark', label: 'Тёмная' },
            ]}
          />
          {isTelegram && <p className="text-xs text-hint mt-2">«Telegram» — цвета берутся из вашей темы Telegram.</p>}
        </Section>

        <Section title="Режим запуска">
          <InfoRow label="Платформа" value={MODE_LABEL[mode]} />
          <InfoRow
            label="Telegram-пользователь"
            value={`${[user.first_name, user.last_name].filter(Boolean).join(' ')}${user.username ? ` (@${user.username})` : ''}${isDemoUser ? ' — demo' : ''}`}
          />
          <InfoRow label="Роль" value={role === 'employer' ? 'Работодатель (Demo Employer)' : 'Студент (Demo Student)'} />
        </Section>

        <Section title="Demo-режим" className="space-y-2">
          <Button
            full
            variant="ghost"
            onClick={() => {
              switchRole(other)
              nav('/home', { replace: true })
            }}
          >
            <Repeat size={18} /> Переключиться на {other === 'employer' ? 'Demo Employer' : 'Demo Student'}
          </Button>
          <Button
            full
            variant="danger"
            onClick={() => {
              if (confirm('Сбросить все данные приложения (профиль, Likes, Matches, сообщения)?')) {
                resetDemo()
                nav('/welcome', { replace: true })
              }
            }}
          >
            <RefreshCw size={18} /> Сбросить демо-данные
          </Button>
        </Section>

        <p className="text-center text-xs text-hint">JobSwipe MVP · данные хранятся только на этом устройстве</p>
      </div>
    </>
  )
}

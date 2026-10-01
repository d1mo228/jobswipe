import { useEffect } from 'react'
import { useApp } from '../context/AppContext'
import {
  applyTelegramTheme,
  getTelegramColorScheme,
  isTelegramWebApp,
  subscribeTelegramTheme,
} from '../integrations/telegram/telegram'

/**
 * Применяет тему к <html>:
 *  - 'system' в Telegram → цвета и light/dark берутся из темы Telegram (--tg-theme-*)
 *  - 'system' в браузере → prefers-color-scheme
 *  - 'light' / 'dark' → ручной выбор в настройках
 */
export function useThemeEffect() {
  const { state } = useApp()
  const mode = state.theme

  useEffect(() => {
    const root = document.documentElement
    const mq = window.matchMedia('(prefers-color-scheme: dark)')

    const apply = () => {
      const tg = isTelegramWebApp()
      let dark: boolean
      if (mode === 'system') {
        dark = tg ? getTelegramColorScheme() === 'dark' : mq.matches
      } else {
        dark = mode === 'dark'
      }
      root.dataset.theme = dark ? 'dark' : 'light'
      if (tg && mode === 'system') {
        applyTelegramTheme()
        root.dataset.tg = '1'
      } else {
        delete root.dataset.tg
      }
      const meta = document.querySelector('meta[name="theme-color"]')
      meta?.setAttribute('content', dark ? '#0f1020' : '#635bff')
    }

    apply()
    mq.addEventListener?.('change', apply)
    const off = subscribeTelegramTheme(apply)
    return () => {
      mq.removeEventListener?.('change', apply)
      off()
    }
  }, [mode])
}

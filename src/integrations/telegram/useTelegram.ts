import { useEffect, useRef, useState } from 'react'
import {
  getTelegramColorScheme,
  getTelegramUserOrFallback,
  isTelegramWebApp,
  showTelegramBackButton,
  showTelegramMainButton,
  subscribeTelegramTheme,
  telegramHaptic,
} from './telegram'

/** Данные о Telegram-контексте для UI. */
export function useTelegram() {
  const [scheme, setScheme] = useState(getTelegramColorScheme())
  useEffect(() => subscribeTelegramTheme(() => setScheme(getTelegramColorScheme())), [])
  const isTelegram = isTelegramWebApp()
  const { user, isDemo } = getTelegramUserOrFallback()
  return { isTelegram, user, isDemoUser: isDemo, colorScheme: scheme, haptic: telegramHaptic }
}

/**
 * Нативная Main Button Telegram. Возвращает true, если кнопка показана нативно —
 * тогда страница не должна рисовать собственную кнопку действия.
 */
export function useMainButton(opts: { text: string; onClick: () => void; visible?: boolean }): boolean {
  const { text, onClick, visible = true } = opts
  const ref = useRef(onClick)
  ref.current = onClick
  const native = isTelegramWebApp()
  useEffect(() => {
    if (!native || !visible) return
    return showTelegramMainButton(text, () => ref.current())
  }, [native, visible, text])
  return native && visible
}

/** Нативная Back Button Telegram (в браузере не делает ничего). */
export function useBackButton(visible: boolean, onClick: () => void): void {
  const ref = useRef(onClick)
  ref.current = onClick
  useEffect(() => {
    if (!visible) return
    return showTelegramBackButton(() => ref.current())
  }, [visible])
}

import { isTelegramWebApp } from '../integrations/telegram/telegram'

export type AppMode = 'telegram' | 'pwa' | 'browser'

/** Определяет контекст запуска: Telegram Mini App, установленное PWA или обычный браузер. */
export function detectAppMode(): AppMode {
  if (isTelegramWebApp()) return 'telegram'
  const standalone =
    (typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)').matches) ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  return standalone ? 'pwa' : 'browser'
}

export const MODE_LABEL: Record<AppMode, string> = {
  telegram: 'Telegram Mini App',
  pwa: 'PWA (установлено)',
  browser: 'Браузер',
}

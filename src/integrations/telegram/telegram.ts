/**
 * Abstraction layer над Telegram WebApp API.
 * ВСЯ Telegram-специфичная логика живёт здесь. UI-компоненты вызывают только эти функции
 * (напрямую или через хуки из useTelegram.ts) и никогда не трогают window.Telegram.
 *
 * Вне Telegram все функции безопасно ничего не делают.
 */
import type { TelegramUser, TelegramWebApp } from './types'

const getWebApp = (): TelegramWebApp | null => {
  if (typeof window === 'undefined') return null
  return window.Telegram?.WebApp ?? null
}

/** SDK подключён и в браузере, поэтому объект есть всегда; реальный Telegram — когда есть initData/платформа. */
export function isTelegramWebApp(): boolean {
  const wa = getWebApp()
  if (!wa) return false
  return wa.initData !== '' || (wa.platform !== '' && wa.platform !== 'unknown')
}

/** Реальный пользователь из Telegram или null. */
export function getTelegramUser(): TelegramUser | null {
  if (!isTelegramWebApp()) return null
  return getWebApp()?.initDataUnsafe?.user ?? null
}

/** Demo-пользователь для запуска вне Telegram. */
export const FALLBACK_TELEGRAM_USER: TelegramUser = {
  id: 0,
  first_name: 'Demo',
  last_name: 'User',
  username: 'demo_user',
}

export function getTelegramUserOrFallback(): { user: TelegramUser; isDemo: boolean } {
  const real = getTelegramUser()
  return real ? { user: real, isDemo: false } : { user: FALLBACK_TELEGRAM_USER, isDemo: true }
}

/**
 * Сырая строка initData — для отправки на ВАШ backend, который обязан проверить подпись
 * (HMAC-SHA256 с ключом, выведенным из токена бота). Клиенту этим данным доверять нельзя:
 * их нельзя использовать для авторизации без серверной проверки, поэтому приложение
 * ничего из initData не сохраняет в localStorage.
 */
export function getTelegramInitData(): string {
  return getWebApp()?.initData ?? ''
}

export function getTelegramStartParam(): string | undefined {
  return getWebApp()?.initDataUnsafe?.start_param
}

export function getTelegramColorScheme(): 'light' | 'dark' | null {
  return isTelegramWebApp() ? (getWebApp()?.colorScheme ?? null) : null
}

/** Вызывать один раз при старте. */
export function initTelegram(): void {
  const wa = getWebApp()
  if (!wa || !isTelegramWebApp()) return
  try {
    wa.ready()
    wa.expand()
    if (wa.isVersionAtLeast('7.7')) wa.disableVerticalSwipes?.()
  } catch {
    /* старые клиенты — не критично */
  }
  applyTelegramViewport()
  const handler = () => applyTelegramViewport()
  for (const ev of ['viewportChanged', 'safeAreaChanged', 'contentSafeAreaChanged']) wa.onEvent(ev, handler)
}

/** Прокидывает высоту viewport и safe areas Telegram в CSS-переменные. */
export function applyTelegramViewport(): void {
  const wa = getWebApp()
  if (!wa || !isTelegramWebApp()) return
  const root = document.documentElement
  const h = wa.viewportStableHeight || wa.viewportHeight
  if (h) root.style.setProperty('--app-height', `${h}px`)
  const sa = wa.safeAreaInset
  const csa = wa.contentSafeAreaInset
  // В Telegram отступы берём из его API (системные + контентные), а env(safe-area-*) обнуляем, чтобы не считать дважды.
  root.style.setProperty('--safe-top', '0px')
  root.style.setProperty('--safe-bottom', '0px')
  root.style.setProperty('--tg-safe-top', `${(sa?.top ?? 0) + (csa?.top ?? 0)}px`)
  root.style.setProperty('--tg-safe-bottom', `${(sa?.bottom ?? 0) + (csa?.bottom ?? 0)}px`)
}

/** Применяет тему Telegram: CSS-переменные --tg-theme-* и data-атрибуты на <html>. */
export function applyTelegramTheme(): void {
  const wa = getWebApp()
  if (!wa || !isTelegramWebApp()) return
  const root = document.documentElement
  for (const [key, value] of Object.entries(wa.themeParams ?? {})) {
    if (value) root.style.setProperty(`--tg-theme-${key.replace(/_/g, '-')}`, value)
  }
  try {
    const bg = wa.themeParams.secondary_bg_color ?? wa.themeParams.bg_color
    if (bg) {
      wa.setHeaderColor(bg)
      wa.setBackgroundColor(bg)
      wa.setBottomBarColor?.(wa.themeParams.bg_color ?? bg)
    }
  } catch {
    /* noop */
  }
}

export function subscribeTelegramTheme(cb: () => void): () => void {
  const wa = getWebApp()
  if (!wa || !isTelegramWebApp()) return () => {}
  wa.onEvent('themeChanged', cb)
  return () => wa.offEvent('themeChanged', cb)
}

export function closeTelegramApp(): void {
  getWebApp()?.close()
}

// ───────── Main Button ─────────
let mainHandler: (() => void) | null = null

export function showTelegramMainButton(text: string, onClick: () => void): () => void {
  const wa = getWebApp()
  if (!wa || !isTelegramWebApp()) return () => {}
  const mb = wa.MainButton
  if (mainHandler) mb.offClick(mainHandler)
  mainHandler = onClick
  mb.setParams({ text, is_visible: true, is_active: true })
  mb.onClick(onClick)
  return () => {
    if (mainHandler === onClick) {
      mb.offClick(onClick)
      mainHandler = null
      hideTelegramMainButton()
    }
  }
}

export function hideTelegramMainButton(): void {
  const wa = getWebApp()
  if (!wa || !isTelegramWebApp()) return
  if (mainHandler) {
    wa.MainButton.offClick(mainHandler)
    mainHandler = null
  }
  wa.MainButton.hide()
}

// ───────── Back Button ─────────
let backHandler: (() => void) | null = null

export function showTelegramBackButton(onClick: () => void): () => void {
  const wa = getWebApp()
  if (!wa || !isTelegramWebApp()) return () => {}
  const bb = wa.BackButton
  if (backHandler) bb.offClick(backHandler)
  backHandler = onClick
  bb.onClick(onClick)
  bb.show()
  return () => {
    if (backHandler === onClick) {
      bb.offClick(onClick)
      backHandler = null
      bb.hide()
    }
  }
}

// ───────── Haptics / share / links ─────────
export function telegramHaptic(kind: 'light' | 'medium' | 'success' | 'warning' | 'select' = 'light'): void {
  const h = getWebApp()?.HapticFeedback
  if (!h || !isTelegramWebApp()) return
  try {
    if (kind === 'success' || kind === 'warning') h.notificationOccurred(kind)
    else if (kind === 'select') h.selectionChanged()
    else h.impactOccurred(kind)
  } catch {
    /* noop */
  }
}

/** Публичные переменные окружения (не секреты). */
const BOT = (import.meta.env.VITE_TELEGRAM_BOT_USERNAME as string | undefined)?.replace(/^@/, '')
const APP = import.meta.env.VITE_TELEGRAM_APP_NAME as string | undefined

/** Deep link, открывающий Mini App сразу на нужном экране (start_param читается в getTelegramStartParam). */
export function buildMiniAppLink(startParam: string): string | null {
  if (!BOT) return null
  return APP
    ? `https://t.me/${BOT}/${APP}?startapp=${encodeURIComponent(startParam)}`
    : `https://t.me/${BOT}?startapp=${encodeURIComponent(startParam)}`
}

/** Открывает нативный диалог «Поделиться» Telegram. Возвращает true, если Telegram обработал запрос. */
export function shareViaTelegram(url: string, text: string): boolean {
  const wa = getWebApp()
  if (!wa || !isTelegramWebApp()) return false
  const link = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
  try {
    wa.openTelegramLink(link)
    return true
  } catch {
    return false
  }
}

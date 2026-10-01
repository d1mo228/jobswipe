/** Минимальные типы Telegram WebApp API — только то, чем пользуется JobSwipe. */

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
  is_premium?: boolean
}

export interface TelegramThemeParams {
  bg_color?: string
  text_color?: string
  hint_color?: string
  link_color?: string
  button_color?: string
  button_text_color?: string
  secondary_bg_color?: string
  header_bg_color?: string
  [key: string]: string | undefined
}

export interface TelegramInset {
  top: number
  bottom: number
  left: number
  right: number
}

export interface TelegramMainButton {
  text: string
  isVisible: boolean
  isActive: boolean
  setText(text: string): TelegramMainButton
  onClick(cb: () => void): TelegramMainButton
  offClick(cb: () => void): TelegramMainButton
  show(): TelegramMainButton
  hide(): TelegramMainButton
  enable(): TelegramMainButton
  disable(): TelegramMainButton
  showProgress(leaveActive?: boolean): TelegramMainButton
  hideProgress(): TelegramMainButton
  setParams(params: { text?: string; color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean }): TelegramMainButton
}

export interface TelegramBackButton {
  isVisible: boolean
  onClick(cb: () => void): TelegramBackButton
  offClick(cb: () => void): TelegramBackButton
  show(): TelegramBackButton
  hide(): TelegramBackButton
}

export interface TelegramHaptic {
  impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void
  notificationOccurred(type: 'error' | 'success' | 'warning'): void
  selectionChanged(): void
}

export interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    user?: TelegramUser
    start_param?: string
    [key: string]: unknown
  }
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  themeParams: TelegramThemeParams
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  safeAreaInset?: TelegramInset
  contentSafeAreaInset?: TelegramInset
  MainButton: TelegramMainButton
  BackButton: TelegramBackButton
  HapticFeedback: TelegramHaptic
  ready(): void
  expand(): void
  close(): void
  isVersionAtLeast(version: string): boolean
  setHeaderColor(color: string): void
  setBackgroundColor(color: string): void
  setBottomBarColor?(color: string): void
  disableVerticalSwipes?(): void
  enableClosingConfirmation?(): void
  disableClosingConfirmation?(): void
  openLink(url: string, options?: { try_instant_view?: boolean }): void
  openTelegramLink(url: string): void
  onEvent(event: string, cb: () => void): void
  offEvent(event: string, cb: () => void): void
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp }
  }
}

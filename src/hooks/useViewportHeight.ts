import { useEffect } from 'react'
import { isTelegramWebApp } from '../integrations/telegram/telegram'

/**
 * В браузерах (особенно iOS Safari/PWA) экранная клавиатура не уменьшает layout viewport.
 * Следим за visualViewport и пишем реальную высоту в --app-height, чтобы поле ввода чата
 * не пряталось под клавиатурой. В Telegram высоту задаёт сам Telegram (см. integrations/telegram).
 */
export function useViewportHeight() {
  useEffect(() => {
    if (isTelegramWebApp()) return
    const vv = window.visualViewport
    const root = document.documentElement
    const set = () => {
      const h = vv?.height ?? window.innerHeight
      root.style.setProperty('--app-height', `${Math.round(h)}px`)
      if (vv && vv.offsetTop > 0) window.scrollTo(0, 0)
    }
    set()
    vv?.addEventListener('resize', set)
    vv?.addEventListener('scroll', set)
    window.addEventListener('resize', set)
    return () => {
      vv?.removeEventListener('resize', set)
      vv?.removeEventListener('scroll', set)
      window.removeEventListener('resize', set)
    }
  }, [])
}

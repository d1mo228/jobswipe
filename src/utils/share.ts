import { buildMiniAppLink, shareViaTelegram, isTelegramWebApp } from '../integrations/telegram/telegram'

export type ShareResult = 'telegram' | 'web-share' | 'copied' | 'failed'

/**
 * Поделиться вакансией:
 *  1) внутри Telegram — нативный диалог Telegram (deep link на Mini App, если задан VITE_TELEGRAM_BOT_USERNAME)
 *  2) иначе Web Share API
 *  3) иначе копирование ссылки
 */
export async function shareJob(jobId: string, title: string, companyName: string): Promise<ShareResult> {
  const text = `${title} — ${companyName}. Нашёл вакансию в JobSwipe`
  const deepLink = buildMiniAppLink(`job_${jobId}`)
  const webUrl = `${location.origin}${location.pathname}#/job/${jobId}`
  const url = deepLink ?? webUrl

  if (isTelegramWebApp() && shareViaTelegram(url, text)) return 'telegram'

  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text, url })
      return 'web-share'
    } catch (e) {
      if ((e as DOMException)?.name === 'AbortError') return 'failed'
    }
  }
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`)
    return 'copied'
  } catch {
    return 'failed'
  }
}

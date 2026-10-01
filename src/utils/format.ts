import type { Employment, Job, WorkFormat, WorkPref } from '../types'

export const FORMAT_LABEL: Record<WorkFormat, string> = { office: 'Офис', hybrid: 'Гибрид', remote: 'Remote' }
export const WORKPREF_LABEL: Record<WorkPref, string> = { ...FORMAT_LABEL, any: 'Любой' }
export const EMPLOYMENT_LABEL: Record<Employment, string> = {
  full: 'Полная занятость',
  part: 'Частичная занятость',
  internship: 'Стажировка',
  project: 'Проектная работа',
}

export const salaryLabel = (j: Pick<Job, 'salaryFrom' | 'salaryTo'>) => `${j.salaryFrom}–${j.salaryTo} тыс. ₽`

export const locationLabel = (j: Pick<Job, 'city' | 'format'>) =>
  j.format === 'remote' ? `${j.city} / Remote` : j.format === 'hybrid' ? `${j.city} / Гибрид` : `${j.city} / Офис`

export const experienceLabel = (months: number) =>
  months === 0 ? 'Опыт не требуется' : months < 12 ? `Опыт от ${months} мес.` : `Опыт от ${Math.round(months / 12)} г.`

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const min = Math.floor(diff / 60_000)
  if (min < 1) return 'только что'
  if (min < 60) return `${min} мин назад`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} ч назад`
  const d = Math.floor(h / 24)
  return `${d} дн назад`
}

export const clockTime = (ts: number) =>
  new Date(ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

export const companySizeLabel = (n: number) => `${n} сотрудников`

export const scoreColor = (score: number) =>
  score >= 75 ? 'var(--c-good)' : score >= 50 ? 'var(--c-warn)' : 'var(--c-bad)'

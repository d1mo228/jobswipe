import { RELATED_DIRECTIONS } from '../data/jobs'
import type { Compatibility, CompatItem, CompatStatus, Filters, Job, StudentProfile } from '../types'

const WEIGHTS = { skills: 40, salary: 20, format: 15, direction: 15, experience: 10 }
const FACTOR: Record<CompatStatus, number> = { ok: 1, partial: 0.5, bad: 0 }

const norm = (s: string) => s.trim().toLowerCase()

/**
 * Mock-алгоритм совместимости профиля и вакансии.
 * Позже эту функцию можно заменить вызовом backend/ML — сигнатура останется той же.
 * Работает в обе стороны: для студента (вакансии) и для работодателя (кандидаты).
 */
export function calculateCompatibility(
  profile: Pick<
    StudentProfile,
    'skills' | 'salary' | 'workFormat' | 'direction' | 'experienceMonths' | 'city'
  >,
  job: Job,
): Compatibility {
  const items: CompatItem[] = []

  // Навыки
  const have = new Set(profile.skills.map(norm))
  const matched = job.skills.filter((s) => have.has(norm(s)))
  const ratio = job.skills.length ? matched.length / job.skills.length : 1
  const skillsStatus: CompatStatus = ratio >= 0.6 ? 'ok' : ratio >= 0.3 ? 'partial' : 'bad'
  items.push({
    key: 'skills',
    label: 'Навыки',
    status: skillsStatus,
    hint: `${matched.length} из ${job.skills.length} совпали`,
  })

  // Зарплата (тыс. ₽)
  let salaryStatus: CompatStatus = 'ok'
  if (profile.salary > job.salaryTo) {
    salaryStatus = profile.salary <= job.salaryTo * 1.15 ? 'partial' : 'bad'
  }
  items.push({
    key: 'salary',
    label: 'Зарплата',
    status: salaryStatus,
    hint: `ожидание ${profile.salary} · вилка ${job.salaryFrom}–${job.salaryTo} тыс. ₽`,
  })

  // Формат работы + город
  let formatStatus: CompatStatus
  const sameCity = norm(profile.city) === norm(job.city)
  if (profile.workFormat === 'any') {
    formatStatus = job.format === 'remote' || sameCity ? 'ok' : 'partial'
  } else if (profile.workFormat === job.format) {
    formatStatus = job.format === 'remote' || sameCity ? 'ok' : 'partial'
  } else if (job.format === 'hybrid' || profile.workFormat === 'hybrid') {
    formatStatus = job.format === 'remote' || sameCity ? 'partial' : 'bad'
  } else {
    formatStatus = 'bad'
  }
  items.push({
    key: 'format',
    label: 'Формат работы',
    status: formatStatus,
    hint: sameCity || job.format === 'remote' ? 'формат подходит' : `вакансия в г. ${job.city}`,
  })

  // Направление
  let directionStatus: CompatStatus = 'bad'
  if (norm(profile.direction) === norm(job.direction)) directionStatus = 'ok'
  else if ((RELATED_DIRECTIONS[profile.direction] ?? []).includes(job.direction)) directionStatus = 'partial'
  items.push({
    key: 'direction',
    label: 'Направление',
    status: directionStatus,
    hint: job.direction,
  })

  // Опыт
  let expStatus: CompatStatus = 'ok'
  if (profile.experienceMonths < job.expMonths) {
    expStatus = profile.experienceMonths >= job.expMonths / 2 ? 'partial' : 'bad'
  }
  items.push({
    key: 'experience',
    label: 'Опыт',
    status: expStatus,
    hint: job.expMonths === 0 ? 'опыт не требуется' : `нужно от ${job.expMonths} мес.`,
  })

  const score = Math.round(
    items.reduce((sum, it) => sum + WEIGHTS[it.key] * FACTOR[it.status], 0),
  )
  return { score, items }
}

/** Применяет фильтры к списку вакансий */
export function applyJobFilters(jobs: Job[], f: Filters): Job[] {
  return jobs.filter((j) => {
    if (f.city && j.city !== f.city && j.format !== 'remote') return false
    if (f.remoteOnly && j.format !== 'remote') return false
    if (f.salaryMin && j.salaryTo < f.salaryMin) return false
    if (f.direction && j.direction !== f.direction) return false
    if (f.employment && j.employment !== f.employment) return false
    if (f.experience === 'none' && j.expMonths > 0) return false
    if (f.experience === 'upto6' && j.expMonths > 6) return false
    if (f.experience === 'upto12' && j.expMonths > 12) return false
    if (f.skills.length) {
      const set = new Set(j.skills.map(norm))
      if (!f.skills.some((s) => set.has(norm(s)))) return false
    }
    return true
  })
}

export function countActiveFilters(f: Filters): number {
  let n = 0
  if (f.city) n++
  if (f.remoteOnly) n++
  if (f.salaryMin) n++
  if (f.direction) n++
  if (f.experience !== 'any') n++
  if (f.employment) n++
  if (f.skills.length) n++
  return n
}

import { RELATED_DIRECTIONS } from '../data/jobs'
import type {
  Candidate,
  CandidateFilters,
  CandidateSort,
  Compatibility,
  CompatItem,
  CompatStatus,
  Filters,
  Job,
  StudentProfile,
} from '../types'

/**
 * ПРОЦЕНТ СОВМЕСТИМОСТИ
 * ─────────────────────
 * Сравниваем анкету кандидата с вакансией по 5 критериям. Каждый критерий даёт
 * коэффициент от 0 до 1, который умножается на вес критерия. Сумма весов = 100,
 * поэтому итог — это сразу проценты.
 *
 *   Навыки         35  — доля требуемых навыков вакансии, которые есть у кандидата
 *   Направление    20  — то же направление = 1, смежное (напр. Маркетинг ↔ Аналитика) = 0.5, иначе 0
 *   Зарплата       15  — ожидания ≤ верхней границы вилки = 1; дальше линейно падает до 0 при +30%
 *   Формат и город 15  — совпал формат и город (или вакансия remote) = 1; частичное совпадение = 0.5
 *   Опыт           15  — опыт кандидата / требуемый опыт (если опыт не нужен — 1)
 *
 * Работает в обе стороны: студент видит совместимость с вакансией, работодатель —
 * совместимость кандидата с выбранной вакансией. Функцию можно заменить реальным
 * алгоритмом/ML на backend — сигнатура останется той же.
 */
export const COMPAT_WEIGHTS = { skills: 35, direction: 20, salary: 15, format: 15, experience: 15 } as const

const norm = (s: string) => s.trim().toLowerCase()
const clamp01 = (n: number) => Math.max(0, Math.min(1, n))
const statusOf = (f: number): CompatStatus => (f >= 0.8 ? 'ok' : f >= 0.4 ? 'partial' : 'bad')

export function calculateCompatibility(
  profile: Pick<StudentProfile, 'skills' | 'salary' | 'workFormat' | 'direction' | 'experienceMonths' | 'city'>,
  job: Job,
): Compatibility {
  const items: CompatItem[] = []
  const add = (key: CompatItem['key'], label: string, factor: number, hint: string) => {
    const weight = COMPAT_WEIGHTS[key]
    items.push({ key, label, status: statusOf(factor), hint, weight, points: Math.round(weight * clamp01(factor) * 10) / 10 })
  }

  // 1. Навыки
  const have = new Set(profile.skills.map(norm))
  const matched = job.skills.filter((s) => have.has(norm(s)))
  const skillsF = job.skills.length ? matched.length / job.skills.length : 1
  add('skills', 'Навыки', skillsF, `${matched.length} из ${job.skills.length} совпали`)

  // 2. Направление
  const sameDir = norm(profile.direction) === norm(job.direction)
  const related = (RELATED_DIRECTIONS[profile.direction] ?? []).includes(job.direction)
  add('direction', 'Направление', sameDir ? 1 : related ? 0.5 : 0, sameDir ? job.direction : related ? `смежное: ${job.direction}` : job.direction)

  // 3. Зарплата (тыс. ₽)
  const over = profile.salary > job.salaryTo ? (profile.salary - job.salaryTo) / job.salaryTo : 0
  add('salary', 'Зарплата', 1 - over / 0.3, `ожидание ${profile.salary} · вилка ${job.salaryFrom}–${job.salaryTo} тыс. ₽`)

  // 4. Формат работы + город
  const sameCity = norm(profile.city) === norm(job.city)
  const placeOk = job.format === 'remote' || sameCity
  let formatF: number
  if (profile.workFormat === 'any' || profile.workFormat === job.format) formatF = placeOk ? 1 : 0.5
  else if (profile.workFormat === 'hybrid' || job.format === 'hybrid') formatF = placeOk ? 0.5 : 0.25
  else formatF = 0
  add('format', 'Формат и город', formatF, placeOk ? 'формат подходит' : `вакансия в г. ${job.city}`)

  // 5. Опыт
  const expF = job.expMonths === 0 ? 1 : profile.experienceMonths / job.expMonths
  add('experience', 'Опыт', expF, job.expMonths === 0 ? 'опыт не требуется' : `${profile.experienceMonths} из ${job.expMonths} мес.`)

  const score = Math.round(items.reduce((sum, it) => sum + it.points, 0))
  return { score, items }
}

// ───────────────────────── Фильтры вакансий (студент) ─────────────────────────

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
  return [f.city, f.remoteOnly, f.salaryMin, f.direction, f.experience !== 'any', f.employment, f.skills.length].filter(Boolean).length
}

// ───────────────────────── Список кандидатов (работодатель) ─────────────────────────

export interface CandidateRow {
  id: string
  c: Candidate
  compat: Compatibility
}

export function applyCandidateFilters(rows: CandidateRow[], f: CandidateFilters): CandidateRow[] {
  return rows.filter(({ c, compat }) => {
    if (f.city && c.city !== f.city) return false
    if (f.workFormat && c.workFormat !== f.workFormat && c.workFormat !== 'any') return false
    if (f.minExpMonths && c.experienceMonths < f.minExpMonths) return false
    if (f.direction && c.direction !== f.direction) return false
    if (f.salaryMax && c.salary > f.salaryMax) return false
    if (f.gradYear && c.gradYear !== f.gradYear) return false
    if (f.minCompat && compat.score < f.minCompat) return false
    if (f.skills.length) {
      const set = new Set(c.skills.map(norm))
      if (!f.skills.some((s) => set.has(norm(s)))) return false
    }
    return true
  })
}

export function sortCandidates(rows: CandidateRow[], sort: CandidateSort): CandidateRow[] {
  const out = [...rows]
  out.sort((a, b) => (sort === 'date' ? b.c.createdAt - a.c.createdAt : b.compat.score - a.compat.score || b.c.createdAt - a.c.createdAt))
  return out
}

export function countActiveCandidateFilters(f: CandidateFilters): number {
  return [f.city, f.workFormat, f.minExpMonths, f.direction, f.skills.length, f.salaryMax, f.gradYear, f.minCompat].filter(Boolean).length
}

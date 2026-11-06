export type Role = 'student' | 'employer'
export type WorkFormat = 'office' | 'hybrid' | 'remote'
export type WorkPref = WorkFormat | 'any'
export type Employment = 'full' | 'part' | 'internship' | 'project'

export interface Company {
  id: string
  name: string
  logoColor: string
  description: string
  industry: string
  size: number
  city: string
  website: string
  /** загруженный логотип (data URL) */
  logoUrl?: string
}

export interface Job {
  id: string
  companyId: string
  title: string
  city: string
  format: WorkFormat
  salaryFrom: number // тыс. ₽
  salaryTo: number // тыс. ₽
  expMonths: number // требуемый опыт в месяцах, 0 = не требуется
  employment: Employment
  direction: string
  skills: string[]
  description: string
  /** Когда вакансия опубликована */
  postedAt?: number
  requirements: string[]
  conditions: string[]
  /** Mock: работодатель уже поставил Like кандидату (студенту) — при Like вакансии будет Match */
  employerLikedYou?: boolean
}

export interface StudentProfile {
  id: string
  name: string
  username?: string
  photoUrl?: string
  university: string
  major: string
  gradYear: number
  city: string
  skills: string[]
  desiredTitle: string
  direction: string
  salary: number // тыс. ₽
  workFormat: WorkPref
  experience: string
  experienceMonths: number
  portfolio: string
  about: string
}

/** Кандидат в ленте работодателя */
export interface Candidate extends StudentProfile {
  /** Когда анкета появилась на платформе (для сортировки «по дате») */
  createdAt: number
  /** Mock: id вакансий, которыми кандидат уже заинтересовался */
  interestedIn: string[]
}

export interface Match {
  id: string
  jobId: string
  companyId: string
  candidateId: string
  createdAt: number
  unread?: boolean
}

export interface Message {
  id: string
  matchId: string
  from: 'me' | 'them'
  text: string
  ts: number
}

export type JobSort = 'compat' | 'new' | 'salary'
export type CompanySize = '' | 'small' | 'mid' | 'large'

export interface Filters {
  city: string
  remoteOnly: boolean
  /** формат работы; '' — любой */
  format: '' | WorkFormat
  salaryMin: number
  direction: string
  experience: 'any' | 'none' | 'upto6' | 'upto12'
  employment: '' | Employment
  skills: string[]
  /** отрасль компании */
  industry: string
  /** размер компании: small < 50, mid 50–300, large > 300 */
  companySize: CompanySize
  /** минимальная совместимость, % */
  minCompat: number
  /** опубликована за последние N дней (0 — любая) */
  postedWithin: number
  sort: JobSort
}

export type ThemeMode = 'system' | 'light' | 'dark'

export type CompatStatus = 'ok' | 'partial' | 'bad'
export interface CompatItem {
  key: 'skills' | 'salary' | 'format' | 'direction' | 'experience'
  label: string
  status: CompatStatus
  hint: string
  /** максимум баллов за критерий (сумма всех = 100) */
  weight: number
  /** сколько баллов набрано */
  points: number
}
export interface Compatibility {
  score: number
  items: CompatItem[]
}

export type Plan = 'free' | 'pro' | 'max'

/** Фильтры работодателя по анкетам кандидатов */
export interface CandidateFilters {
  city: string
  workFormat: '' | WorkFormat
  /** минимальный опыт кандидата, мес. */
  minExpMonths: number
  direction: string
  skills: string[]
  /** максимальные зарплатные ожидания кандидата, тыс. ₽ (0 = не важно) */
  salaryMax: number
  /** год выпуска (0 = любой) */
  gradYear: number
  /** минимальный процент совместимости */
  minCompat: number
  /** максимальный опыт, мес. (0 = не важно) */
  maxExpMonths: number
  /** все выбранные навыки обязательны (иначе — любой из них) */
  skillsAll: boolean
  /** часть названия университета */
  university: string
  /** только с портфолио */
  hasPortfolio: boolean
  /** просмотренные / ещё не просмотренные */
  viewed: '' | 'viewed' | 'new'
  /** анкета добавлена за последние N дней (0 = любая) */
  addedWithin: number
}

export type CandidateSort = 'compat' | 'new' | 'viewed'

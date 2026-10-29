import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { buildDemoEmployerState, buildDemoStudentState, DEFAULT_CANDIDATE_FILTERS, DEFAULT_FILTERS } from '../data/demo'
import { JOBS } from '../data/jobs'
import { getTelegramUser } from '../integrations/telegram/telegram'
import { mockApi } from '../services/mockApi'
import { PLANS, todayKey } from '../services/plans'
import { storage } from '../services/storage'
import type { Candidate, CandidateFilters, Company, Filters, Job, Match, Message, Plan, Role, StudentProfile, ThemeMode } from '../types'

interface StudentSlice {
  profile: StudentProfile
  likes: string[]
  passes: string[]
  matches: Match[]
  messages: Record<string, Message[]>
  filters: Filters
  /** анкета заполнена */
  setupDone: boolean
}

interface EmployerSlice {
  company: Company
  jobs: Job[]
  /** ключи вида `${jobId}:${candidateId}` */
  likes: string[]
  passes: string[]
  matches: Match[]
  messages: Record<string, Message[]>
  setupDone: boolean
  /** выбранный тариф; null — тариф ещё не выбран */
  plan: Plan | null
  /** какие анкеты открыты за текущие сутки (лимит зависит от тарифа) */
  views: { date: string; ids: string[] }
  candidateFilters: CandidateFilters
}

interface AppState {
  v: 1
  role: Role | null
  onboarded: boolean
  theme: ThemeMode
  student: StudentSlice | null
  employer: EmployerSlice | null
}

const INITIAL: AppState = { v: 1, role: null, onboarded: false, theme: 'system', student: null, employer: null }
const KEY = 'state'

const uid = (p: string) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

function load(): AppState {
  const s = storage.get<AppState>(KEY, INITIAL)
  if (!s || s.v !== 1) return INITIAL
  // миграция данных, сохранённых прежними версиями приложения
  return {
    ...s,
    student: s.student && { ...s.student, setupDone: s.student.setupDone ?? true },
    employer: s.employer && {
      ...s.employer,
      setupDone: s.employer.setupDone ?? true,
      plan: s.employer.plan === undefined ? 'free' : s.employer.plan,
      views: s.employer.views ?? { date: todayKey(), ids: [] },
      candidateFilters: s.employer.candidateFilters ?? DEFAULT_CANDIDATE_FILTERS,
    },
  }
}

const BLANK_PROFILE: StudentProfile = {
  id: 'student-me',
  name: '',
  university: '',
  major: '',
  gradYear: new Date().getFullYear() + 1,
  city: 'Москва',
  skills: [],
  desiredTitle: '',
  direction: 'Маркетинг',
  salary: 0,
  workFormat: 'any',
  experience: '',
  experienceMonths: 0,
  portfolio: '',
  about: '',
}

const BLANK_COMPANY: Company = {
  id: 'c-me',
  name: '',
  logoColor: '#635bff',
  description: '',
  industry: '',
  size: 10,
  city: 'Москва',
  website: '',
}

interface AppApi {
  state: AppState
  role: Role | null
  student: StudentSlice | null
  employer: EmployerSlice | null
  /** Match'и и сообщения текущей роли */
  matches: Match[]
  messages: Record<string, Message[]>
  /** demo=true — заполненный демо-аккаунт, иначе пустой аккаунт + анкета */
  startAs: (role: Role, demo?: boolean) => void
  switchRole: (role: Role) => void
  resetDemo: () => void
  setTheme: (t: ThemeMode) => void
  completeStudentSetup: (p: StudentProfile) => void
  completeEmployerSetup: (company: Company, firstJob: Omit<Job, 'id' | 'companyId'>) => void
  // студент
  swipeJob: (jobId: string, dir: 'like' | 'pass') => Match | null
  updateProfile: (p: StudentProfile) => void
  setFilters: (f: Filters) => void
  resetSwipes: () => void
  // работодатель
  swipeCandidate: (jobId: string, candidate: Candidate, dir: 'like' | 'pass') => Match | null
  updateCompany: (c: Company) => void
  setPlan: (plan: Plan) => void
  setCandidateFilters: (f: CandidateFilters) => void
  /** Засчитывает просмотр анкеты. false — дневной лимит тарифа исчерпан. */
  viewCandidate: (candidateId: string) => boolean
  /** Сводка по дневному лимиту просмотров */
  viewInfo: { limit: number | null; used: number; remaining: number | null; ids: string[] }
  addJob: (j: Omit<Job, 'id' | 'companyId'>) => Job
  // чат
  sendMessage: (matchId: string, text: string) => void
  receiveMessage: (matchId: string, text: string) => void
  markRead: (matchId: string) => void
}

const Ctx = createContext<AppApi | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(load)
  const ref = useRef(state)
  ref.current = state

  useEffect(() => {
    storage.set(KEY, state)
  }, [state])

  /** Применяет изменение к актуальному состоянию (безопасно для вызова подряд). */
  const commit = useCallback((fn: (s: AppState) => AppState) => {
    const next = fn(ref.current)
    ref.current = next
    setState(next)
  }, [])

  const buildStudent = useCallback((): StudentSlice => {
    const d = buildDemoStudentState()
    const tg = getTelegramUser()
    // В Telegram профиль строится из реального Telegram-аккаунта (имя не спрашиваем повторно)
    const profile: StudentProfile = tg
      ? {
          ...d.profile,
          name: [tg.first_name, tg.last_name].filter(Boolean).join(' '),
          username: tg.username,
          photoUrl: tg.photo_url,
        }
      : d.profile
    return { profile, likes: d.likes, passes: d.passes, matches: d.matches, messages: d.messages, filters: DEFAULT_FILTERS, setupDone: true }
  }, [])

  const blankStudent = useCallback((): StudentSlice => {
    const tg = getTelegramUser()
    const profile = tg
      ? { ...BLANK_PROFILE, name: [tg.first_name, tg.last_name].filter(Boolean).join(' '), username: tg.username, photoUrl: tg.photo_url }
      : BLANK_PROFILE
    return { profile, likes: [], passes: [], matches: [], messages: {}, filters: DEFAULT_FILTERS, setupDone: false }
  }, [])

  const blankEmployer = useCallback(
    (): EmployerSlice => ({
      company: BLANK_COMPANY,
      jobs: [],
      likes: [],
      passes: [],
      matches: [],
      messages: {},
      setupDone: false,
      plan: null,
      views: { date: todayKey(), ids: [] },
      candidateFilters: DEFAULT_CANDIDATE_FILTERS,
    }),
    [],
  )

  const buildEmployer = useCallback((): EmployerSlice => {
    const d = buildDemoEmployerState()
    return {
      company: d.company,
      jobs: JOBS.filter((j) => d.jobIds.includes(j.id)),
      likes: d.likes,
      passes: d.passes,
      matches: d.matches,
      messages: d.messages,
      setupDone: true,
      plan: 'free',
      views: { date: todayKey(), ids: [] },
      candidateFilters: DEFAULT_CANDIDATE_FILTERS,
    }
  }, [])

  const startAs = useCallback(
    (role: Role, demo = false) =>
      commit((s) => ({
        ...s,
        role,
        onboarded: true,
        student: role === 'student' ? (demo ? buildStudent() : (s.student ?? blankStudent())) : s.student,
        employer: role === 'employer' ? (demo ? buildEmployer() : (s.employer ?? blankEmployer())) : s.employer,
      })),
    [commit, buildStudent, buildEmployer, blankStudent, blankEmployer],
  )

  const completeStudentSetup = useCallback(
    (profile: StudentProfile) => commit((s) => ({ ...s, student: s.student && { ...s.student, profile, setupDone: true } })),
    [commit],
  )
  const completeEmployerSetup = useCallback(
    (company: Company, firstJob: Omit<Job, 'id' | 'companyId'>) =>
      commit((s) => {
        if (!s.employer) return s
        const job: Job = { ...firstJob, id: uid('j'), companyId: company.id }
        return { ...s, employer: { ...s.employer, company, jobs: [job, ...s.employer.jobs], setupDone: true } }
      }),
    [commit],
  )
  const setPlan = useCallback(
    (plan: Plan) => commit((s) => ({ ...s, employer: s.employer && { ...s.employer, plan } })),
    [commit],
  )
  const setCandidateFilters = useCallback(
    (candidateFilters: CandidateFilters) => commit((s) => ({ ...s, employer: s.employer && { ...s.employer, candidateFilters } })),
    [commit],
  )
  const viewCandidate = useCallback(
    (candidateId: string): boolean => {
      const em = ref.current.employer
      if (!em) return false
      const today = todayKey()
      const ids = em.views.date === today ? em.views.ids : []
      if (ids.includes(candidateId)) return true
      const limit = PLANS[em.plan ?? 'free'].dailyLimit
      if (limit !== null && ids.length >= limit) return false
      commit((s) => ({ ...s, employer: s.employer && { ...s.employer, views: { date: today, ids: [...ids, candidateId] } } }))
      return true
    },
    [commit],
  )

  const resetDemo = useCallback(() => commit((s) => ({ ...INITIAL, theme: s.theme })), [commit])
  const setTheme = useCallback((theme: ThemeMode) => commit((s) => ({ ...s, theme })), [commit])

  // ───── студент ─────
  const swipeJob = useCallback(
    (jobId: string, dir: 'like' | 'pass'): Match | null => {
      const st = ref.current.student
      if (!st) return null
      if (dir === 'pass') {
        commit((s) => ({ ...s, student: { ...s.student!, passes: [...new Set([...s.student!.passes, jobId])] } }))
        return null
      }
      const job = mockApi.getJob(jobId)
      const alreadyMatched = st.matches.some((m) => m.jobId === jobId)
      let match: Match | null = null
      if (job && !alreadyMatched && mockApi.employerLikesStudent(job)) {
        match = {
          id: uid('m'),
          jobId,
          companyId: job.companyId,
          candidateId: st.profile.id,
          createdAt: Date.now(),
          unread: true,
        }
      }
      commit((s) => {
        const cur = s.student!
        return {
          ...s,
          student: {
            ...cur,
            likes: [...new Set([...cur.likes, jobId])],
            matches: match ? [match, ...cur.matches] : cur.matches,
            messages: match ? { ...cur.messages, [match.id]: [] } : cur.messages,
          },
        }
      })
      return match
    },
    [commit],
  )

  const updateProfile = useCallback(
    (profile: StudentProfile) => commit((s) => ({ ...s, student: s.student && { ...s.student, profile } })),
    [commit],
  )
  const setFilters = useCallback(
    (filters: Filters) => commit((s) => ({ ...s, student: s.student && { ...s.student, filters } })),
    [commit],
  )
  const resetSwipes = useCallback(
    () =>
      commit((s) => {
        if (s.role === 'employer' && s.employer) {
          const matched = new Set(s.employer.matches.map((m) => `${m.jobId}:${m.candidateId}`))
          return {
            ...s,
            employer: { ...s.employer, passes: [], likes: s.employer.likes.filter((k) => matched.has(k)) },
          }
        }
        if (!s.student) return s
        const matched = new Set(s.student.matches.map((m) => m.jobId))
        return {
          ...s,
          student: { ...s.student, passes: [], likes: s.student.likes.filter((id) => matched.has(id)) },
        }
      }),
    [commit],
  )

  // ───── работодатель ─────
  const swipeCandidate = useCallback(
    (jobId: string, candidate: Candidate, dir: 'like' | 'pass'): Match | null => {
      const em = ref.current.employer
      if (!em) return null
      const key = `${jobId}:${candidate.id}`
      if (dir === 'pass') {
        commit((s) => ({ ...s, employer: { ...s.employer!, passes: [...new Set([...s.employer!.passes, key])] } }))
        return null
      }
      let match: Match | null = null
      const jobObj = em.jobs.find((j) => j.id === jobId)
      if (jobObj && !em.matches.some((m) => m.jobId === jobId && m.candidateId === candidate.id) && mockApi.studentLikesJob(candidate, jobObj)) {
        match = { id: uid('m'), jobId, companyId: em.company.id, candidateId: candidate.id, createdAt: Date.now(), unread: true }
      }
      commit((s) => {
        const cur = s.employer!
        return {
          ...s,
          employer: {
            ...cur,
            likes: [...new Set([...cur.likes, key])],
            matches: match ? [match, ...cur.matches] : cur.matches,
            messages: match ? { ...cur.messages, [match.id]: [] } : cur.messages,
          },
        }
      })
      return match
    },
    [commit],
  )

  const updateCompany = useCallback(
    (company: Company) => commit((s) => ({ ...s, employer: s.employer && { ...s.employer, company } })),
    [commit],
  )

  const addJob = useCallback(
    (j: Omit<Job, 'id' | 'companyId'>): Job => {
      const job: Job = { ...j, id: uid('j'), companyId: ref.current.employer?.company.id ?? 'c-nova' }
      commit((s) => ({ ...s, employer: s.employer && { ...s.employer, jobs: [job, ...s.employer.jobs] } }))
      return job
    },
    [commit],
  )

  // ───── чат ─────
  const pushMessage = useCallback(
    (matchId: string, from: 'me' | 'them', text: string) =>
      commit((s) => {
        const key = s.role === 'employer' ? 'employer' : 'student'
        const slice = s[key]
        if (!slice) return s
        const msg: Message = { id: uid('msg'), matchId, from, text, ts: Date.now() }
        const matches = slice.matches.map((m) => (m.id === matchId && from === 'them' ? { ...m, unread: true } : m))
        return {
          ...s,
          [key]: { ...slice, matches, messages: { ...slice.messages, [matchId]: [...(slice.messages[matchId] ?? []), msg] } },
        } as AppState
      }),
    [commit],
  )
  const sendMessage = useCallback((matchId: string, text: string) => pushMessage(matchId, 'me', text), [pushMessage])
  const receiveMessage = useCallback((matchId: string, text: string) => pushMessage(matchId, 'them', text), [pushMessage])

  const markRead = useCallback(
    (matchId: string) =>
      commit((s) => {
        const key = s.role === 'employer' ? 'employer' : 'student'
        const slice = s[key]
        if (!slice || !slice.matches.some((m) => m.id === matchId && m.unread)) return s
        return { ...s, [key]: { ...slice, matches: slice.matches.map((m) => (m.id === matchId ? { ...m, unread: false } : m)) } } as AppState
      }),
    [commit],
  )

  const switchRole = useCallback(
    (role: Role) =>
      commit((s) => ({
        ...s,
        role,
        onboarded: true,
        student: role === 'student' ? (s.student ?? buildStudent()) : s.student,
        employer: role === 'employer' ? (s.employer ?? buildEmployer()) : s.employer,
      })),
    [commit, buildStudent, buildEmployer],
  )

  const api = useMemo<AppApi>(() => {
    const slice = state.role === 'employer' ? state.employer : state.student
    const em = state.employer
    const limit = PLANS[em?.plan ?? 'free'].dailyLimit
    const ids = em && em.views.date === todayKey() ? em.views.ids : []
    const viewInfo = { limit, used: ids.length, remaining: limit === null ? null : Math.max(0, limit - ids.length), ids }
    return {
      state,
      role: state.role,
      student: state.student,
      employer: state.employer,
      matches: slice?.matches ?? [],
      messages: slice?.messages ?? {},
      startAs,
      completeStudentSetup,
      completeEmployerSetup,
      setPlan,
      setCandidateFilters,
      viewCandidate,
      viewInfo,
      switchRole,
      resetDemo,
      setTheme,
      swipeJob,
      updateProfile,
      setFilters,
      resetSwipes,
      swipeCandidate,
      updateCompany,
      addJob,
      sendMessage,
      receiveMessage,
      markRead,
    }
  }, [state, startAs, completeStudentSetup, completeEmployerSetup, setPlan, setCandidateFilters, viewCandidate, switchRole, resetDemo, setTheme, swipeJob, updateProfile, setFilters, resetSwipes, swipeCandidate, updateCompany, addJob, sendMessage, receiveMessage, markRead])

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useApp(): AppApi {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp must be used inside AppProvider')
  return v
}

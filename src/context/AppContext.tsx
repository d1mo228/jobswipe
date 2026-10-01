import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { buildDemoEmployerState, buildDemoStudentState, DEFAULT_FILTERS } from '../data/demo'
import { JOBS } from '../data/jobs'
import { getTelegramUser } from '../integrations/telegram/telegram'
import { mockApi } from '../services/mockApi'
import { storage } from '../services/storage'
import type { Candidate, Company, Filters, Job, Match, Message, Role, StudentProfile, ThemeMode } from '../types'

interface StudentSlice {
  profile: StudentProfile
  likes: string[]
  passes: string[]
  matches: Match[]
  messages: Record<string, Message[]>
  filters: Filters
}

interface EmployerSlice {
  company: Company
  jobs: Job[]
  /** ключи вида `${jobId}:${candidateId}` */
  likes: string[]
  passes: string[]
  matches: Match[]
  messages: Record<string, Message[]>
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
  return s && s.v === 1 ? s : INITIAL
}

interface AppApi {
  state: AppState
  role: Role | null
  student: StudentSlice | null
  employer: EmployerSlice | null
  /** Match'и и сообщения текущей роли */
  matches: Match[]
  messages: Record<string, Message[]>
  startAs: (role: Role) => void
  switchRole: (role: Role) => void
  resetDemo: () => void
  setTheme: (t: ThemeMode) => void
  // студент
  swipeJob: (jobId: string, dir: 'like' | 'pass') => Match | null
  updateProfile: (p: StudentProfile) => void
  setFilters: (f: Filters) => void
  resetSwipes: () => void
  // работодатель
  swipeCandidate: (jobId: string, candidate: Candidate, dir: 'like' | 'pass') => Match | null
  updateCompany: (c: Company) => void
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
    return { profile, likes: d.likes, passes: d.passes, matches: d.matches, messages: d.messages, filters: DEFAULT_FILTERS }
  }, [])

  const buildEmployer = useCallback((): EmployerSlice => {
    const d = buildDemoEmployerState()
    return {
      company: d.company,
      jobs: JOBS.filter((j) => d.jobIds.includes(j.id)),
      likes: d.likes,
      passes: d.passes,
      matches: d.matches,
      messages: d.messages,
    }
  }, [])

  const startAs = useCallback(
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
      if (!em.matches.some((m) => m.jobId === jobId && m.candidateId === candidate.id) && mockApi.studentLikesJob(candidate, jobId)) {
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

  const switchRole = useCallback((role: Role) => startAs(role), [startAs])

  const api = useMemo<AppApi>(() => {
    const slice = state.role === 'employer' ? state.employer : state.student
    return {
      state,
      role: state.role,
      student: state.student,
      employer: state.employer,
      matches: slice?.matches ?? [],
      messages: slice?.messages ?? {},
      startAs,
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
  }, [state, startAs, switchRole, resetDemo, setTheme, swipeJob, updateProfile, setFilters, resetSwipes, swipeCandidate, updateCompany, addJob, sendMessage, receiveMessage, markRead])

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useApp(): AppApi {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp must be used inside AppProvider')
  return v
}

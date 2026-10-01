import { Heart, RotateCcw, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CandidateCard, JobCard } from '../components/Cards'
import { MatchOverlay } from '../components/MatchOverlay'
import { SwipeDeck, type SwipeDeckHandle, type SwipeDir } from '../components/SwipeDeck'
import { Select } from '../components/forms'
import { Avatar, Button, CompanyLogo, EmptyState } from '../components/ui'
import { useApp } from '../context/AppContext'
import { telegramHaptic } from '../integrations/telegram/telegram'
import { applyJobFilters, calculateCompatibility, countActiveFilters } from '../services/matching'
import { mockApi } from '../services/mockApi'
import { DEFAULT_FILTERS } from '../data/demo'
import type { Candidate, Company, Job, Match } from '../types'

export default function HomePage() {
  const { role } = useApp()
  return role === 'employer' ? <EmployerHome /> : <StudentHome />
}

function ActionButtons({ onPass, onLike }: { onPass: () => void; onLike: () => void }) {
  return (
    <div className="flex items-center justify-center gap-10 py-3">
      <button
        onClick={onPass}
        aria-label="Пропустить"
        className="w-16 h-16 rounded-full bg-surface border border-line shadow-card flex items-center justify-center active:scale-90 transition"
        style={{ color: 'var(--c-bad)' }}
      >
        <X size={30} strokeWidth={2.5} />
      </button>
      <button
        onClick={onLike}
        aria-label="Лайк"
        className="w-16 h-16 rounded-full bg-accent text-accent-ink shadow-card flex items-center justify-center active:scale-90 transition"
      >
        <Heart size={28} fill="currentColor" />
      </button>
    </div>
  )
}

function HomeHeader({ right }: { right?: React.ReactNode }) {
  return (
    <header className="pt-safe">
      <div className="h-14 px-5 flex items-center justify-between">
        <div className="text-lg font-black tracking-[0.15em] text-accent">JOBSWIPE</div>
        {right}
      </div>
    </header>
  )
}

// ───────────────────────── Студент ─────────────────────────
function StudentHome() {
  const nav = useNavigate()
  const { student, swipeJob, resetSwipes, setFilters } = useApp()
  const deck = useRef<SwipeDeckHandle>(null)
  const [matched, setMatched] = useState<{ match: Match; company: Company } | null>(null)

  const profile = student!.profile
  const filters = student!.filters
  const seen = useMemo(() => new Set([...student!.likes, ...student!.passes]), [student!.likes, student!.passes])

  const jobs = useMemo(() => {
    return applyJobFilters(mockApi.getAllJobs(), filters)
      .filter((j) => !seen.has(j.id))
      .map((j) => ({ job: j, compat: calculateCompatibility(profile, j), id: j.id }))
      .sort((a, b) => b.compat.score - a.compat.score)
  }, [filters, seen, profile])

  const active = countActiveFilters(filters)

  const onSwipe = (item: { job: Job }, dir: SwipeDir) => {
    telegramHaptic(dir === 'like' ? 'medium' : 'light')
    const m = swipeJob(item.job.id, dir)
    if (m) {
      const company = mockApi.getCompany(item.job.companyId)!
      setMatched({ match: m, company })
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <HomeHeader
        right={
          <button onClick={() => nav('/filters')} className="relative h-10 px-3 rounded-full bg-surface border border-line flex items-center gap-2 text-sm font-medium">
            <SlidersHorizontal size={16} /> Фильтры
            {active > 0 && <span className="w-5 h-5 rounded-full bg-accent text-accent-ink text-[11px] font-bold flex items-center justify-center">{active}</span>}
          </button>
        }
      />
      {jobs.length > 0 ? (
        <>
          <div className="relative flex-1 min-h-[380px] mx-4 mt-2 mb-9 max-h-[640px]">
            <SwipeDeck
              ref={deck}
              items={jobs}
              onSwipe={onSwipe}
              onOpen={(it) => nav(`/job/${it.job.id}`)}
              renderCard={(it) => <JobCard job={it.job} company={mockApi.getCompany(it.job.companyId)!} compat={it.compat} mySkills={profile.skills} />}
            />
          </div>
          <ActionButtons onPass={() => deck.current?.swipe('pass')} onLike={() => deck.current?.swipe('like')} />
          <p className="hidden md:block text-center text-xs text-hint pb-3">Стрелки ← → на клавиатуре тоже работают</p>
        </>
      ) : (
        <EmptyState icon={<RotateCcw size={28} />} title="Вакансии закончились" text={active ? 'Попробуйте ослабить фильтры или начните просмотр заново.' : 'Вы посмотрели все доступные вакансии. Можно начать заново.'}>
          {active > 0 && <Button onClick={() => setFilters(DEFAULT_FILTERS)}>Сбросить фильтры</Button>}
          <Button variant={active ? 'ghost' : 'primary'} onClick={resetSwipes}>Начать заново</Button>
        </EmptyState>
      )}

      <MatchOverlay
        open={!!matched}
        left={<Avatar name={profile.name} src={profile.photoUrl} size={104} />}
        right={matched ? <CompanyLogo name={matched.company.name} color={matched.company.logoColor} size={104} /> : null}
        text={matched ? `Вы и ${matched.company.name} заинтересованы друг в друге.` : ''}
        onChat={() => {
          const id = matched!.match.id
          setMatched(null)
          nav(`/chat/${id}`)
        }}
        onContinue={() => setMatched(null)}
      />
    </div>
  )
}

// ───────────────────────── Работодатель ─────────────────────────
function EmployerHome() {
  const nav = useNavigate()
  const { employer, swipeCandidate, resetSwipes } = useApp()
  const deck = useRef<SwipeDeckHandle>(null)
  const [jobId, setJobId] = useState(employer!.jobs[0]?.id ?? '')
  const [matched, setMatched] = useState<{ match: Match; candidate: Candidate } | null>(null)

  const company = employer!.company
  const job = employer!.jobs.find((j) => j.id === jobId)
  const seen = useMemo(() => new Set([...employer!.likes, ...employer!.passes]), [employer!.likes, employer!.passes])

  const list = useMemo(() => {
    if (!job) return []
    return mockApi
      .getAllCandidates()
      .filter((c) => !seen.has(`${job.id}:${c.id}`))
      .map((c) => ({ c, id: c.id, compat: calculateCompatibility(c, job) }))
      .sort((a, b) => b.compat.score - a.compat.score)
  }, [job, seen])

  const onSwipe = (item: { c: Candidate }, dir: SwipeDir) => {
    if (!job) return
    telegramHaptic(dir === 'like' ? 'medium' : 'light')
    const m = swipeCandidate(job.id, item.c, dir)
    if (m) setMatched({ match: m, candidate: item.c })
  }

  if (!employer!.jobs.length) {
    return (
      <div className="flex flex-col flex-1">
        <HomeHeader />
        <EmptyState icon={<RotateCcw size={28} />} title="Нет вакансий" text="Опубликуйте вакансию, чтобы смотреть кандидатов.">
          <Button onClick={() => nav('/new-job')}>Новая вакансия</Button>
        </EmptyState>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <HomeHeader />
      <div className="px-4">
        <Select value={jobId} onChange={(e) => setJobId(e.target.value)} aria-label="Вакансия">
          {employer!.jobs.map((j) => (
            <option key={j.id} value={j.id}>{j.title}</option>
          ))}
        </Select>
      </div>

      {list.length > 0 ? (
        <>
          <div className="relative flex-1 min-h-[380px] mx-4 mt-3 mb-9 max-h-[640px]">
            <SwipeDeck
              ref={deck}
              items={list}
              onSwipe={onSwipe}
              onOpen={(it) => nav(`/candidate/${it.c.id}?job=${jobId}`)}
              renderCard={(it) => <CandidateCard c={it.c} compat={it.compat} jobSkills={job?.skills ?? []} />}
            />
          </div>
          <ActionButtons onPass={() => deck.current?.swipe('pass')} onLike={() => deck.current?.swipe('like')} />
        </>
      ) : (
        <EmptyState icon={<RotateCcw size={28} />} title="Кандидаты закончились" text="Вы посмотрели всех кандидатов по этой вакансии.">
          <Button onClick={resetSwipes}>Начать заново</Button>
        </EmptyState>
      )}

      <MatchOverlay
        open={!!matched}
        left={<CompanyLogo name={company.name} color={company.logoColor} size={104} />}
        right={matched ? <Avatar name={matched.candidate.name} src={matched.candidate.photoUrl} size={104} /> : null}
        text={matched ? `Вы и ${matched.candidate.name} заинтересованы друг в друге.` : ''}
        onChat={() => {
          const id = matched!.match.id
          setMatched(null)
          nav(`/chat/${id}`)
        }}
        onContinue={() => setMatched(null)}
      />
    </div>
  )
}

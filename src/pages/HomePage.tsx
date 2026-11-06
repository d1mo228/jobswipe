import { Heart, RotateCcw, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { JobCard } from '../components/Cards'
import { MatchOverlay } from '../components/MatchOverlay'
import { SwipeDeck, type SwipeDeckHandle, type SwipeDir } from '../components/SwipeDeck'
import { Avatar, Button, CompanyLogo, EmptyState, Wordmark, cx } from '../components/ui'
import { useApp } from '../context/AppContext'
import { DEFAULT_FILTERS } from '../data/demo'
import { telegramHaptic } from '../integrations/telegram/telegram'
import { applyJobFilters, calculateCompatibility, countActiveFilters } from '../services/matching'
import { mockApi } from '../services/mockApi'
import type { Company, Job, JobSort, Match } from '../types'
import EmployerHome from './EmployerHome'

export default function HomePage() {
  const { role } = useApp()
  return role === 'employer' ? <EmployerHome /> : <StudentHome />
}

function ActionButtons({ onPass, onLike }: { onPass: () => void; onLike: () => void }) {
  return (
    <div className="flex items-center justify-center gap-6 py-2">
      <button onClick={onPass} aria-label="Пропустить" className="w-[60px] h-[60px] rounded-full bg-surface border border-line shadow-soft flex items-center justify-center active:scale-90 transition" style={{ color: 'var(--c-bad)' }}>
        <X size={28} strokeWidth={2.5} />
      </button>
      <button onClick={onLike} aria-label="Лайк" className="w-[68px] h-[68px] rounded-full btn-primary text-accent-ink shadow-glow flex items-center justify-center active:scale-90 transition">
        <Heart size={28} fill="currentColor" />
      </button>
    </div>
  )
}

const SORTS: { v: JobSort; label: string }[] = [
  { v: 'compat', label: 'По совместимости' },
  { v: 'new', label: 'Сначала новые' },
  { v: 'salary', label: 'По зарплате' },
]

function StudentHome() {
  const nav = useNavigate()
  const { student, swipeJob, resetSwipes, setFilters } = useApp()
  const deck = useRef<SwipeDeckHandle>(null)
  const [matched, setMatched] = useState<{ match: Match; company: Company } | null>(null)

  const profile = student!.profile
  const filters = { ...DEFAULT_FILTERS, ...student!.filters }
  const seen = useMemo(() => new Set([...student!.likes, ...student!.passes]), [student!.likes, student!.passes])

  const jobs = useMemo(() => {
    const list = applyJobFilters(mockApi.getAllJobs(), filters)
      .filter((j) => !seen.has(j.id))
      .map((j) => ({ job: j, compat: calculateCompatibility(profile, j), id: j.id }))
      .filter((x) => x.compat.score >= filters.minCompat)
    list.sort((a, b) => {
      if (filters.sort === 'new') return (b.job.postedAt ?? 0) - (a.job.postedAt ?? 0)
      if (filters.sort === 'salary') return b.job.salaryTo - a.job.salaryTo
      return b.compat.score - a.compat.score
    })
    return list
  }, [student!.filters, seen, profile])

  const active = countActiveFilters(filters)

  const onSwipe = (item: { job: Job }, dir: SwipeDir) => {
    telegramHaptic(dir === 'like' ? 'medium' : 'light')
    const m = swipeJob(item.job.id, dir)
    if (m) setMatched({ match: m, company: mockApi.getCompany(item.job.companyId)! })
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <header className="pt-safe">
        <div className="h-14 px-5 flex items-center justify-between">
          <Wordmark size={19} />
          <button onClick={() => nav('/filters')} className="h-10 pl-3 pr-3.5 rounded-full bg-surface border border-line/80 shadow-soft flex items-center gap-2 text-sm font-semibold active:scale-95 transition">
            <SlidersHorizontal size={15} /> Фильтры
            {active > 0 && <span className="min-w-5 h-5 px-1 rounded-full bg-accent text-accent-ink text-[11px] font-bold flex items-center justify-center">{active}</span>}
          </button>
        </div>
        <div className="px-5 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar" role="tablist" aria-label="Сортировка">
          {SORTS.map((s) => (
            <button key={s.v} role="tab" aria-selected={filters.sort === s.v} onClick={() => setFilters({ ...filters, sort: s.v })} className={cx('h-8 px-3.5 rounded-full text-[13px] font-semibold whitespace-nowrap transition border', filters.sort === s.v ? 'bg-ink text-bg border-ink' : 'bg-transparent text-hint border-line')}>
              {s.label}
            </button>
          ))}
          <span className="self-center text-xs text-hint pl-1 whitespace-nowrap">{jobs.length} вакансий</span>
        </div>
      </header>

      {jobs.length > 0 ? (
        <>
          <div className="relative flex-1 min-h-[380px] mx-4 mt-1 mb-9 max-h-[640px]">
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
          {active > 0 && <Button onClick={() => setFilters({ ...DEFAULT_FILTERS, sort: filters.sort })}>Сбросить фильтры</Button>}
          <Button variant={active ? 'ghost' : 'primary'} onClick={resetSwipes}>Начать заново</Button>
        </EmptyState>
      )}

      <MatchOverlay
        open={!!matched}
        left={<Avatar name={profile.name} src={profile.photoUrl} size={104} />}
        right={matched ? <CompanyLogo src={matched.company.logoUrl} name={matched.company.name} color={matched.company.logoColor} size={104} /> : null}
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

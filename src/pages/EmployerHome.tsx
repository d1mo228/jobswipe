import { Lock, SlidersHorizontal, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Select } from '../components/forms'
import { Avatar, Badge, Button, EmptyState, ScoreRing, Wordmark, cx } from '../components/ui'
import { useApp } from '../context/AppContext'
import { applyCandidateFilters, calculateCompatibility, countActiveCandidateFilters, sortCandidates } from '../services/matching'
import { mockApi } from '../services/mockApi'
import { PLANS } from '../services/plans'
import type { CandidateSort } from '../types'
import { timeAgo, WORKPREF_LABEL } from '../utils/format'

const SORTS: { v: CandidateSort; label: string }[] = [
  { v: 'compat', label: 'По совместимости' },
  { v: 'new', label: 'Сначала новые' },
  { v: 'viewed', label: 'Сначала просмотренные' },
]

export default function EmployerHome() {
  const nav = useNavigate()
  const { employer, viewInfo } = useApp()
  const em = employer!
  const [jobId, setJobId] = useState(em.jobs[0]?.id ?? '')
  const [sort, setSort] = useState<CandidateSort>('compat')
  const job = em.jobs.find((j) => j.id === jobId) ?? em.jobs[0]
  const plan = PLANS[em.plan ?? 'free']
  const active = countActiveCandidateFilters(em.candidateFilters)

  const rows = useMemo(() => {
    if (!job) return []
    const all = mockApi.getAllCandidates().map((c) => ({ id: c.id, c, compat: calculateCompatibility(c, job) }))
    return sortCandidates(applyCandidateFilters(all, em.candidateFilters, viewInfo.ids), sort, viewInfo.ids)
  }, [job, em.candidateFilters, sort, viewInfo.ids])

  const locked = viewInfo.remaining === 0
  const pct = viewInfo.limit ? Math.min(100, (viewInfo.used / viewInfo.limit) * 100) : 100

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <header className="pt-safe">
        <div className="h-14 px-5 flex items-center justify-between">
          <Wordmark size={19} />
          <button onClick={() => nav('/candidate-filters')} className="h-10 pl-3 pr-3.5 rounded-full bg-surface border border-line/80 shadow-soft flex items-center gap-2 text-sm font-semibold active:scale-95 transition">
            <SlidersHorizontal size={15} /> Фильтры
            {active > 0 && <span className="min-w-5 h-5 px-1 rounded-full bg-accent text-accent-ink text-[11px] font-bold flex items-center justify-center">{active}</span>}
          </button>
        </div>
      </header>

      <div className="px-4 space-y-3 pb-3">
        {/* Тариф и лимит */}
        <div className="rounded-[22px] p-4 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2b2670, #4b43e6 60%, #7d76ff)' }}>
          <div className="absolute -right-8 -top-10 w-32 h-32 rounded-full bg-white/10" />
          <div className="relative flex items-end justify-between">
            <div>
              <div className="text-[11px] font-bold tracking-[.14em] uppercase text-white/70">Тариф {plan.name}</div>
              <div className="font-display text-2xl font-extrabold mt-0.5">
                {viewInfo.limit === null ? 'Без лимита' : <>{viewInfo.used}<span className="text-white/60 text-lg"> / {viewInfo.limit}</span></>}
              </div>
              <div className="text-xs text-white/70">{viewInfo.limit === null ? 'анкет в день' : 'анкет открыто сегодня'}</div>
            </div>
            {viewInfo.limit !== null && (
              <button onClick={() => nav('/plans')} className="h-9 px-3.5 rounded-full bg-white text-[#3b33c9] text-[13px] font-bold active:scale-95 transition">
                {locked ? 'Повысить' : 'Тарифы'}
              </button>
            )}
          </div>
          {viewInfo.limit !== null && (
            <div className="relative h-1.5 rounded-full bg-white/20 mt-3 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: locked ? '#ff8b8f' : '#fff' }} />
            </div>
          )}
        </div>

        {em.jobs.length > 1 && (
          <Select value={job?.id} onChange={(e) => setJobId(e.target.value)} aria-label="Вакансия">
            {em.jobs.map((j) => <option key={j.id} value={j.id}>Для вакансии: {j.title}</option>)}
          </Select>
        )}

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4" role="tablist" aria-label="Сортировка">
          {SORTS.map((s) => (
            <button key={s.v} role="tab" aria-selected={sort === s.v} onClick={() => setSort(s.v)} className={cx('h-8 px-3.5 rounded-full text-[13px] font-semibold whitespace-nowrap transition border', sort === s.v ? 'bg-ink text-bg border-ink' : 'text-hint border-line')}>
              {s.label}
            </button>
          ))}
        </div>
        <div className="text-xs text-hint">Найдено: {rows.length}</div>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={<Users size={28} />} title="Никого не найдено" text="Попробуйте ослабить фильтры.">
          {active > 0 && <Button onClick={() => nav('/candidate-filters')}>Изменить фильтры</Button>}
        </EmptyState>
      ) : (
        <ul className="px-4 pb-6 space-y-2.5">
          {rows.map(({ c, compat }, i) => {
            const seen = viewInfo.ids.includes(c.id)
            const blocked = locked && !seen
            return (
              <li key={c.id} className="rise" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                <button onClick={() => nav(`/candidate/${c.id}?job=${job?.id}`)} className="w-full bg-surface rounded-[22px] p-3.5 border border-line/70 shadow-soft flex items-center gap-3.5 text-left active:scale-[0.99] transition">
                  <div className="relative">
                    <Avatar name={c.name} src={c.photoUrl} size={50} />
                    {blocked && <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-ink text-bg flex items-center justify-center"><Lock size={11} /></span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-display font-extrabold truncate">{c.name}</div>
                    <div className="text-sm truncate">{c.desiredTitle}</div>
                    <div className="text-xs text-hint truncate">{c.university} · {c.city} · {WORKPREF_LABEL[c.workFormat]} · от {c.salary} тыс.</div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {c.skills.slice(0, 3).map((s) => <Badge key={s}>{s}</Badge>)}
                      {c.experienceMonths > 0 && <Badge tone="outline">{c.experienceMonths} мес.</Badge>}
                      {seen && <Badge tone="good">Просмотрена</Badge>}
                    </div>
                    <div className="text-[11px] text-hint mt-1">Добавлена {timeAgo(c.createdAt)}</div>
                  </div>
                  <ScoreRing score={compat.score} size={52} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

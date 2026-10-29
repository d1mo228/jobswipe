import { ArrowUpDown, Lock, SlidersHorizontal, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Select } from '../components/forms'
import { Avatar, Badge, Button, EmptyState, ScoreRing, cx } from '../components/ui'
import { useApp } from '../context/AppContext'
import { applyCandidateFilters, calculateCompatibility, countActiveCandidateFilters, sortCandidates } from '../services/matching'
import { mockApi } from '../services/mockApi'
import { PLANS } from '../services/plans'
import type { CandidateSort } from '../types'
import { timeAgo, WORKPREF_LABEL } from '../utils/format'

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
    return sortCandidates(applyCandidateFilters(all, em.candidateFilters), sort)
  }, [job, em.candidateFilters, sort])

  const locked = viewInfo.remaining === 0
  const pct = viewInfo.limit ? Math.min(100, (viewInfo.used / viewInfo.limit) * 100) : 0

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <header className="pt-safe">
        <div className="h-14 px-5 flex items-center justify-between">
          <div className="text-lg font-black tracking-[0.15em] text-accent">JOBSWIPE</div>
          <button onClick={() => nav('/candidate-filters')} className="h-10 px-3 rounded-full bg-surface border border-line flex items-center gap-2 text-sm font-medium">
            <SlidersHorizontal size={16} /> Фильтры
            {active > 0 && <span className="w-5 h-5 rounded-full bg-accent text-accent-ink text-[11px] font-bold flex items-center justify-center">{active}</span>}
          </button>
        </div>
      </header>

      <div className="px-4 space-y-3 pb-3">
        <div className="bg-surface rounded-2xl p-3.5 shadow-soft">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">Тариф {plan.name}</span>
            <span className="text-hint">{viewInfo.limit === null ? 'Безлимитный просмотр' : `Просмотрено сегодня: ${viewInfo.used} из ${viewInfo.limit}`}</span>
          </div>
          {viewInfo.limit !== null && (
            <div className="h-1.5 rounded-full bg-surface2 mt-2 overflow-hidden">
              <div className="h-full bg-accent transition-all" style={{ width: `${pct}%`, background: locked ? 'var(--c-bad)' : undefined }} />
            </div>
          )}
          {viewInfo.limit !== null && (
            <button onClick={() => nav('/plans')} className="text-xs font-semibold text-accent mt-2">
              {locked ? 'Лимит исчерпан — повысить тариф' : 'Нужно больше анкет? Сменить тариф'}
            </button>
          )}
        </div>

        {em.jobs.length > 1 && (
          <Select value={job?.id} onChange={(e) => setJobId(e.target.value)} aria-label="Вакансия">
            {em.jobs.map((j) => <option key={j.id} value={j.id}>Для вакансии: {j.title}</option>)}
          </Select>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-hint">Найдено: {rows.length}</div>
          <div className="flex bg-surface2 rounded-xl p-1 gap-1 text-xs font-medium">
            <ArrowUpDown size={14} className="self-center ml-1.5 text-hint" />
            {([['compat', 'По совместимости'], ['date', 'По дате']] as const).map(([v, label]) => (
              <button key={v} onClick={() => setSort(v)} className={cx('h-8 px-3 rounded-lg', sort === v ? 'bg-surface shadow-soft text-ink' : 'text-hint')}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={<Users size={28} />} title="Никого не найдено" text="Попробуйте ослабить фильтры.">
          {active > 0 && <Button onClick={() => nav('/candidate-filters')}>Изменить фильтры</Button>}
        </EmptyState>
      ) : (
        <ul className="px-4 pb-6 space-y-2.5">
          {rows.map(({ c, compat }) => {
            const seen = viewInfo.ids.includes(c.id)
            const blocked = locked && !seen
            return (
              <li key={c.id}>
                <button onClick={() => nav(`/candidate/${c.id}?job=${job?.id}`)} className="w-full bg-surface rounded-2xl p-3.5 shadow-soft flex items-center gap-3 text-left active:scale-[0.99] transition">
                  <div className="relative">
                    <Avatar name={c.name} src={c.photoUrl} size={48} />
                    {blocked && <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-ink text-bg flex items-center justify-center"><Lock size={11} /></span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold truncate">{c.name}</div>
                    <div className="text-sm truncate">{c.desiredTitle}</div>
                    <div className="text-xs text-hint truncate">{c.university} · {c.city} · {WORKPREF_LABEL[c.workFormat]} · от {c.salary} тыс. ₽</div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {c.skills.slice(0, 3).map((s) => <Badge key={s}>{s}</Badge>)}
                      {c.experienceMonths > 0 && <Badge>Опыт {c.experienceMonths} мес.</Badge>}
                      {seen && <Badge tone="good">Просмотрена</Badge>}
                    </div>
                    <div className="text-[11px] text-hint mt-1">Анкета добавлена {timeAgo(c.createdAt)}</div>
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

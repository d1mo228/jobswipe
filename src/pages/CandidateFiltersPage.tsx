import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ChipPicker, Field, Segmented, Select } from '../components/forms'
import { Button, PageHeader, Section } from '../components/ui'
import { useApp } from '../context/AppContext'
import { DEFAULT_CANDIDATE_FILTERS } from '../data/demo'
import { ALL_SKILLS, CITIES, DIRECTIONS } from '../data/jobs'
import { useMainButton } from '../integrations/telegram/useTelegram'
import type { CandidateFilters } from '../types'

export default function CandidateFiltersPage() {
  const nav = useNavigate()
  const { role, employer, setCandidateFilters } = useApp()
  const [f, setF] = useState<CandidateFilters>(employer?.candidateFilters ?? DEFAULT_CANDIDATE_FILTERS)
  const patch = (p: Partial<CandidateFilters>) => setF((c) => ({ ...c, ...p }))
  const apply = () => {
    setCandidateFilters(f)
    nav('/home', { replace: true })
  }
  const native = useMainButton({ text: 'Применить', onClick: apply })
  if (role !== 'employer') return <Navigate to="/home" replace />
  const num = (set: (n: number) => void) => (e: React.ChangeEvent<HTMLSelectElement>) => set(Number(e.target.value))

  return (
    <>
      <PageHeader title="Фильтры кандидатов" right={<button onClick={() => setF(DEFAULT_CANDIDATE_FILTERS)} className="text-sm font-medium text-accent px-2 h-10">Сбросить</button>} />
      <div className="px-4 pb-8 space-y-3">
        <Section className="space-y-4">
          <Field label="Город">
            <Select value={f.city} onChange={(e) => patch({ city: e.target.value })}><option value="">Любой</option>{CITIES.map((c) => <option key={c}>{c}</option>)}</Select>
          </Field>
          <Field label="Формат работы">
            <Segmented value={f.workFormat} onChange={(v) => patch({ workFormat: v })} options={[{ value: '', label: 'Любой' }, { value: 'office', label: 'Офис' }, { value: 'hybrid', label: 'Гибрид' }, { value: 'remote', label: 'Remote' }]} />
          </Field>
          <Field label="Опыт кандидата">
            <Select value={String(f.minExpMonths)} onChange={num((n) => patch({ minExpMonths: n }))}>
              {[[0, 'Любой'], [3, 'от 3 мес.'], [6, 'от 6 мес.'], [12, 'от 1 года'], [18, 'от 1,5 лет']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
          </Field>
          <Field label="Направление">
            <Select value={f.direction} onChange={(e) => patch({ direction: e.target.value })}><option value="">Любое</option>{DIRECTIONS.map((d) => <option key={d}>{d}</option>)}</Select>
          </Field>
          <Field label="Зарплатные ожидания до (тыс. ₽)">
            <Select value={String(f.salaryMax)} onChange={num((n) => patch({ salaryMax: n }))}>
              {[0, 60, 80, 100, 120, 150].map((n) => <option key={n} value={n}>{n === 0 ? 'Не важно' : `до ${n}`}</option>)}
            </Select>
          </Field>
          <Field label="Год выпуска">
            <Select value={String(f.gradYear)} onChange={num((n) => patch({ gradYear: n }))}>
              <option value={0}>Любой</option>{[2025, 2026, 2027, 2028].map((y) => <option key={y} value={y}>{y}</option>)}
            </Select>
          </Field>
          <Field label="Совместимость не ниже">
            <Select value={String(f.minCompat)} onChange={num((n) => patch({ minCompat: n }))}>
              {[0, 40, 60, 75, 90].map((n) => <option key={n} value={n}>{n === 0 ? 'Любая' : `${n}%`}</option>)}
            </Select>
          </Field>
        </Section>
        <Section title="Навыки (любой из выбранных)"><ChipPicker options={ALL_SKILLS} value={f.skills} onChange={(skills) => patch({ skills })} /></Section>
        {!native && <Button full onClick={apply}>Применить</Button>}
      </div>
    </>
  )
}

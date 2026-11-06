import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ChipPicker, Field, OptionChips, Select, TextInput, Toggle } from '../components/forms'
import { Button, PageHeader, Section } from '../components/ui'
import { useApp } from '../context/AppContext'
import { DEFAULT_CANDIDATE_FILTERS } from '../data/demo'
import { ALL_SKILLS, CITIES, DIRECTIONS } from '../data/jobs'
import { useMainButton } from '../integrations/telegram/useTelegram'
import type { CandidateFilters } from '../types'

export default function CandidateFiltersPage() {
  const nav = useNavigate()
  const { role, employer, setCandidateFilters } = useApp()
  const [f, setF] = useState<CandidateFilters>({ ...DEFAULT_CANDIDATE_FILTERS, ...employer?.candidateFilters })
  const patch = (p: Partial<CandidateFilters>) => setF((c) => ({ ...c, ...p }))
  const apply = () => {
    setCandidateFilters(f)
    nav('/home', { replace: true })
  }
  const native = useMainButton({ text: 'Применить', onClick: apply })
  if (role !== 'employer') return <Navigate to="/home" replace />

  return (
    <>
      <PageHeader title="Фильтры кандидатов" right={<button onClick={() => setF(DEFAULT_CANDIDATE_FILTERS)} className="text-sm font-semibold text-accent px-2 h-10">Сбросить</button>} />
      <div className="px-4 pb-8 space-y-3">
        <Section title="Статус анкеты" className="space-y-4">
          <Field label="Просмотр">
            <OptionChips value={f.viewed} onChange={(v) => patch({ viewed: v })} options={[{ value: '', label: 'Все' }, { value: 'new', label: 'Ещё не открывал' }, { value: 'viewed', label: 'Просмотренные' }]} />
          </Field>
          <Field label="Анкета добавлена">
            <OptionChips value={f.addedWithin} onChange={(v) => patch({ addedWithin: v })} options={[{ value: 0, label: 'Любое время' }, { value: 1, label: 'Сегодня' }, { value: 7, label: 'За неделю' }, { value: 30, label: 'За месяц' }]} />
          </Field>
          <Field label="Совместимость не ниже">
            <OptionChips value={f.minCompat} onChange={(v) => patch({ minCompat: v })} options={[0, 40, 60, 75, 90].map((n) => ({ value: n, label: n === 0 ? 'Любая' : `${n}%` }))} />
          </Field>
        </Section>

        <Section title="Кто ищет" className="space-y-4">
          <Field label="Город">
            <Select value={f.city} onChange={(e) => patch({ city: e.target.value })}><option value="">Любой</option>{CITIES.map((c) => <option key={c}>{c}</option>)}</Select>
          </Field>
          <Field label="Формат работы">
            <OptionChips value={f.workFormat} onChange={(v) => patch({ workFormat: v })} options={[{ value: '', label: 'Любой' }, { value: 'office', label: 'Офис' }, { value: 'hybrid', label: 'Гибрид' }, { value: 'remote', label: 'Remote' }]} />
          </Field>
          <Field label="Направление">
            <Select value={f.direction} onChange={(e) => patch({ direction: e.target.value })}><option value="">Любое</option>{DIRECTIONS.map((d) => <option key={d}>{d}</option>)}</Select>
          </Field>
          <Field label="Зарплатные ожидания до (тыс. ₽)">
            <OptionChips value={f.salaryMax} onChange={(v) => patch({ salaryMax: v })} options={[0, 60, 80, 100, 120, 150].map((n) => ({ value: n, label: n === 0 ? 'Любые' : `до ${n}` }))} />
          </Field>
        </Section>

        <Section title="Опыт и образование" className="space-y-4">
          <Field label="Опыт от">
            <OptionChips value={f.minExpMonths} onChange={(v) => patch({ minExpMonths: v })} options={[{ value: 0, label: 'Любой' }, { value: 3, label: '3 мес.' }, { value: 6, label: '6 мес.' }, { value: 12, label: '1 год' }, { value: 18, label: '1,5 года' }]} />
          </Field>
          <Field label="Опыт до" hint="Например, «до 6 мес.» — чтобы найти джунов без большого стажа">
            <OptionChips value={f.maxExpMonths} onChange={(v) => patch({ maxExpMonths: v })} options={[{ value: 0, label: 'Не важно' }, { value: 6, label: '6 мес.' }, { value: 12, label: '1 год' }, { value: 24, label: '2 года' }]} />
          </Field>
          <Field label="Год выпуска">
            <OptionChips value={f.gradYear} onChange={(v) => patch({ gradYear: v })} options={[{ value: 0, label: 'Любой' }, ...[2025, 2026, 2027, 2028].map((y) => ({ value: y, label: String(y) }))]} />
          </Field>
          <Field label="Университет"><TextInput value={f.university} onChange={(e) => patch({ university: e.target.value })} placeholder="Например, ВШЭ" /></Field>
          <Toggle checked={f.hasPortfolio} onChange={(v) => patch({ hasPortfolio: v })} label="Только с портфолио" />
        </Section>

        <Section title="Навыки">
          <ChipPicker options={ALL_SKILLS} value={f.skills} onChange={(skills) => patch({ skills })} />
          <div className="mt-3 border-t border-line pt-1"><Toggle checked={f.skillsAll} onChange={(v) => patch({ skillsAll: v })} label="Нужны все выбранные навыки" /></div>
        </Section>

        {!native && <Button full onClick={apply}>Применить</Button>}
      </div>
    </>
  )
}

import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ChipPicker, Field, OptionChips, Select } from '../components/forms'
import { Button, PageHeader, Section } from '../components/ui'
import { useApp } from '../context/AppContext'
import { COMPANIES } from '../data/companies'
import { DEFAULT_FILTERS } from '../data/demo'
import { ALL_SKILLS, CITIES, DIRECTIONS } from '../data/jobs'
import { useMainButton } from '../integrations/telegram/useTelegram'
import type { Filters } from '../types'
import { EMPLOYMENT_LABEL } from '../utils/format'

const INDUSTRIES = [...new Set(COMPANIES.map((c) => c.industry))]

export default function FiltersPage() {
  const nav = useNavigate()
  const { role, student, setFilters } = useApp()
  const [f, setF] = useState<Filters>({ ...DEFAULT_FILTERS, ...student?.filters })
  const patch = (p: Partial<Filters>) => setF((cur) => ({ ...cur, ...p }))

  const apply = () => {
    setFilters(f)
    nav('/home', { replace: true })
  }
  const native = useMainButton({ text: 'Применить', onClick: apply })
  if (role !== 'student') return <Navigate to="/home" replace />

  return (
    <>
      <PageHeader title="Фильтры" right={<button onClick={() => setF({ ...DEFAULT_FILTERS, sort: f.sort })} className="text-sm font-semibold text-accent px-2 h-10">Сбросить</button>} />
      <div className="px-4 pb-8 space-y-3">
        <Section title="Где и как" className="space-y-4">
          <Field label="Город" hint="Remote-вакансии показываются в любом городе">
            <Select value={f.city} onChange={(e) => patch({ city: e.target.value })}>
              <option value="">Любой</option>
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Формат работы">
            <OptionChips value={f.format} onChange={(v) => patch({ format: v, remoteOnly: false })} options={[{ value: '', label: 'Любой' }, { value: 'office', label: 'Офис' }, { value: 'hybrid', label: 'Гибрид' }, { value: 'remote', label: 'Remote' }]} />
          </Field>
          <Field label="Тип занятости">
            <OptionChips value={f.employment} onChange={(v) => patch({ employment: v })} options={[{ value: '', label: 'Любой' }, ...Object.entries(EMPLOYMENT_LABEL).map(([k, v]) => ({ value: k as Filters['employment'], label: v }))]} />
          </Field>
        </Section>

        <Section title="Деньги и опыт" className="space-y-4">
          <Field label="Зарплата от (тыс. ₽)">
            <OptionChips value={f.salaryMin} onChange={(v) => patch({ salaryMin: v })} options={[0, 40, 60, 80, 100, 120, 150].map((n) => ({ value: n, label: n === 0 ? 'Любая' : `${n}+` }))} />
          </Field>
          <Field label="Требуемый опыт">
            <OptionChips value={f.experience} onChange={(v) => patch({ experience: v })} options={[{ value: 'any', label: 'Любой' }, { value: 'none', label: 'Без опыта' }, { value: 'upto6', label: 'до 6 мес.' }, { value: 'upto12', label: 'до 1 года' }]} />
          </Field>
        </Section>

        <Section title="Компания" className="space-y-4">
          <Field label="Отрасль">
            <Select value={f.industry} onChange={(e) => patch({ industry: e.target.value })}>
              <option value="">Любая</option>
              {INDUSTRIES.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Размер компании">
            <OptionChips value={f.companySize} onChange={(v) => patch({ companySize: v })} options={[{ value: '', label: 'Любой' }, { value: 'small', label: 'до 50' }, { value: 'mid', label: '50–300' }, { value: 'large', label: '300+' }]} />
          </Field>
        </Section>

        <Section title="Вакансия" className="space-y-4">
          <Field label="Направление">
            <Select value={f.direction} onChange={(e) => patch({ direction: e.target.value })}>
              <option value="">Любое</option>
              {DIRECTIONS.map((d) => <option key={d}>{d}</option>)}
            </Select>
          </Field>
          <Field label="Опубликована">
            <OptionChips value={f.postedWithin} onChange={(v) => patch({ postedWithin: v })} options={[{ value: 0, label: 'Когда угодно' }, { value: 1, label: 'Сегодня' }, { value: 7, label: 'За неделю' }, { value: 14, label: 'За 2 недели' }]} />
          </Field>
          <Field label="Совместимость не ниже">
            <OptionChips value={f.minCompat} onChange={(v) => patch({ minCompat: v })} options={[0, 40, 60, 75, 90].map((n) => ({ value: n, label: n === 0 ? 'Любая' : `${n}%` }))} />
          </Field>
        </Section>

        <Section title="Навыки (любой из выбранных)">
          <ChipPicker options={ALL_SKILLS} value={f.skills} onChange={(skills) => patch({ skills })} />
        </Section>

        {!native && <Button full onClick={apply}>Применить</Button>}
      </div>
    </>
  )
}

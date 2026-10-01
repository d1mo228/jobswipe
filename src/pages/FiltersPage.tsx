import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ChipPicker, Field, Segmented, Select, Toggle } from '../components/forms'
import { Button, PageHeader, Section } from '../components/ui'
import { useApp } from '../context/AppContext'
import { ALL_SKILLS, CITIES, DIRECTIONS } from '../data/jobs'
import { DEFAULT_FILTERS } from '../data/demo'
import { useMainButton } from '../integrations/telegram/useTelegram'
import type { Filters } from '../types'
import { EMPLOYMENT_LABEL } from '../utils/format'

export default function FiltersPage() {
  const nav = useNavigate()
  const { role, student, setFilters } = useApp()
  const [f, setF] = useState<Filters>(student?.filters ?? DEFAULT_FILTERS)
  const patch = (p: Partial<Filters>) => setF((cur) => ({ ...cur, ...p }))

  const apply = () => {
    setFilters(f)
    nav('/home', { replace: true })
  }
  const native = useMainButton({ text: 'Применить', onClick: apply })

  if (role !== 'student') return <Navigate to="/home" replace />

  return (
    <>
      <PageHeader title="Фильтры" right={<button onClick={() => setF(DEFAULT_FILTERS)} className="text-sm font-medium text-accent px-2 h-10">Сбросить</button>} />
      <div className="px-4 pb-8 space-y-3">
        <Section className="space-y-4">
          <Field label="Город" hint="Remote-вакансии показываются в любом городе">
            <Select value={f.city} onChange={(e) => patch({ city: e.target.value })}>
              <option value="">Любой</option>
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </Field>
          <Toggle checked={f.remoteOnly} onChange={(v) => patch({ remoteOnly: v })} label="Только remote" />
          <Field label="Зарплата от (тыс. ₽)">
            <Select value={String(f.salaryMin)} onChange={(e) => patch({ salaryMin: Number(e.target.value) })}>
              {[0, 40, 60, 80, 100, 120, 150].map((n) => <option key={n} value={n}>{n === 0 ? 'Не важно' : `от ${n}`}</option>)}
            </Select>
          </Field>
          <Field label="Направление">
            <Select value={f.direction} onChange={(e) => patch({ direction: e.target.value })}>
              <option value="">Любое</option>
              {DIRECTIONS.map((d) => <option key={d}>{d}</option>)}
            </Select>
          </Field>
          <Field label="Тип занятости">
            <Select value={f.employment} onChange={(e) => patch({ employment: e.target.value as Filters['employment'] })}>
              <option value="">Любой</option>
              {Object.entries(EMPLOYMENT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </Field>
          <Field label="Требуемый опыт">
            <Segmented
              value={f.experience}
              onChange={(v) => patch({ experience: v })}
              options={[
                { value: 'any', label: 'Любой' },
                { value: 'none', label: 'Без опыта' },
                { value: 'upto6', label: 'до 6 мес.' },
                { value: 'upto12', label: 'до 1 г.' },
              ]}
            />
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

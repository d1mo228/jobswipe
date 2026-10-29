import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ChipPicker, Field, Segmented, Select, TextArea, TextInput } from '../components/forms'
import { useToast } from '../components/Toast'
import { Button } from '../components/ui'
import { useApp } from '../context/AppContext'
import { ALL_SKILLS, CITIES, DIRECTIONS } from '../data/jobs'
import { useBackButton, useMainButton } from '../integrations/telegram/useTelegram'
import type { Company, Employment, Job, StudentProfile, WorkFormat, WorkPref } from '../types'
import { EMPLOYMENT_LABEL, FORMAT_LABEL } from '../utils/format'

export default function SetupPage() {
  const { role, student, employer } = useApp()
  if (role === 'student' && student) return student.setupDone ? <Navigate to="/home" replace /> : <StudentSetup />
  if (role === 'employer' && employer) return employer.setupDone ? <Navigate to="/home" replace /> : <EmployerSetup />
  return <Navigate to="/welcome" replace />
}

function Wizard({
  step,
  total,
  title,
  subtitle,
  children,
  onNext,
  onBack,
  nextLabel,
}: {
  step: number
  total: number
  title: string
  subtitle: string
  children: React.ReactNode
  onNext: () => void
  onBack: () => void
  nextLabel: string
}) {
  const native = useMainButton({ text: nextLabel, onClick: onNext })
  useBackButton(step > 0, onBack)
  return (
    <div className="mx-auto max-w-xl px-4 pt-safe pb-safe" style={{ minHeight: 'var(--app-height, 100dvh)' }}>
      <div className="pt-6 pb-4">
        <div className="flex gap-1.5 mb-3">
          {Array.from({ length: total }, (_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-accent' : 'bg-surface2'}`} />
          ))}
        </div>
        <div className="text-xs text-hint">Шаг {step + 1} из {total}</div>
        <h1 className="text-2xl font-extrabold">{title}</h1>
        <p className="text-sm text-hint">{subtitle}</p>
      </div>
      <div className="bg-surface rounded-3xl p-4 shadow-soft space-y-4">{children}</div>
      {!native && (
        <div className="flex gap-3 py-5">
          {step > 0 && <Button variant="ghost" onClick={onBack} className="flex-1">Назад</Button>}
          <Button onClick={onNext} className="flex-[2]">{nextLabel}</Button>
        </div>
      )}
    </div>
  )
}

// ───────── Анкета студента ─────────
function StudentSetup() {
  const nav = useNavigate()
  const toast = useToast()
  const { student, completeStudentSetup } = useApp()
  const [step, setStep] = useState(0)
  const [p, setP] = useState<StudentProfile>(student!.profile)
  const patch = (x: Partial<StudentProfile>) => setP((c) => ({ ...c, ...x }))

  const next = () => {
    if (step === 0 && !p.name.trim()) return toast('Укажите имя')
    if (step === 1 && (!p.university.trim() || !p.major.trim())) return toast('Укажите университет и специальность')
    if (step === 2) {
      if (!p.desiredTitle.trim()) return toast('Укажите желаемую должность')
      if (!p.skills.length) return toast('Выберите хотя бы один навык')
      completeStudentSetup({ ...p, name: p.name.trim() })
      return nav('/home', { replace: true })
    }
    setStep(step + 1)
  }

  const titles = [
    ['Расскажите о себе', 'Это увидят работодатели'],
    ['Образование и опыт', 'Опыт не обязателен — учтём стажировки и проекты'],
    ['Что вы ищете', 'По этим данным считаем совместимость с вакансиями'],
  ]
  return (
    <Wizard step={step} total={3} title={titles[step][0]} subtitle={titles[step][1]} onNext={next} onBack={() => setStep(step - 1)} nextLabel={step === 2 ? 'Готово' : 'Далее'}>
      {step === 0 && (
        <>
          <Field label="Имя и фамилия"><TextInput value={p.name} onChange={(e) => patch({ name: e.target.value })} autoComplete="name" /></Field>
          <Field label="Город">
            <Select value={p.city} onChange={(e) => patch({ city: e.target.value })}>{CITIES.map((c) => <option key={c}>{c}</option>)}</Select>
          </Field>
          <Field label="О себе"><TextArea value={p.about} onChange={(e) => patch({ about: e.target.value })} placeholder="Пара предложений о ваших целях" /></Field>
        </>
      )}
      {step === 1 && (
        <>
          <Field label="Университет"><TextInput value={p.university} onChange={(e) => patch({ university: e.target.value })} /></Field>
          <Field label="Специальность"><TextInput value={p.major} onChange={(e) => patch({ major: e.target.value })} /></Field>
          <Field label="Год выпуска"><TextInput type="number" inputMode="numeric" value={p.gradYear || ''} onChange={(e) => patch({ gradYear: Number(e.target.value) })} /></Field>
          <Field label="Опыт, стажировки, проекты"><TextArea value={p.experience} onChange={(e) => patch({ experience: e.target.value })} /></Field>
          <Field label="Опыт работы (месяцев)"><TextInput type="number" inputMode="numeric" value={p.experienceMonths} onChange={(e) => patch({ experienceMonths: Math.max(0, Number(e.target.value)) })} /></Field>
          <Field label="Портфолио (ссылка)"><TextInput type="url" value={p.portfolio} onChange={(e) => patch({ portfolio: e.target.value })} placeholder="https://" /></Field>
        </>
      )}
      {step === 2 && (
        <>
          <Field label="Желаемая должность"><TextInput value={p.desiredTitle} onChange={(e) => patch({ desiredTitle: e.target.value })} placeholder="Junior Data Analyst" /></Field>
          <Field label="Направление">
            <Select value={p.direction} onChange={(e) => patch({ direction: e.target.value })}>{DIRECTIONS.map((d) => <option key={d}>{d}</option>)}</Select>
          </Field>
          <Field label="Зарплата от (тыс. ₽)"><TextInput type="number" inputMode="numeric" value={p.salary || ''} onChange={(e) => patch({ salary: Number(e.target.value) })} /></Field>
          <Field label="Формат работы">
            <Segmented<WorkPref> value={p.workFormat} onChange={(v) => patch({ workFormat: v })} options={[{ value: 'any', label: 'Любой' }, { value: 'office', label: 'Офис' }, { value: 'hybrid', label: 'Гибрид' }, { value: 'remote', label: 'Remote' }]} />
          </Field>
          <Field label="Навыки"><ChipPicker options={ALL_SKILLS} value={p.skills} onChange={(skills) => patch({ skills })} allowCustom /></Field>
        </>
      )}
    </Wizard>
  )
}

// ───────── Анкета работодателя ─────────
function EmployerSetup() {
  const nav = useNavigate()
  const toast = useToast()
  const { employer, completeEmployerSetup } = useApp()
  const [step, setStep] = useState(0)
  const [c, setC] = useState<Company>(employer!.company)
  const [job, setJob] = useState<Omit<Job, 'id' | 'companyId'>>({
    title: '', city: c.city, format: 'hybrid', salaryFrom: 60, salaryTo: 90, expMonths: 0, employment: 'full',
    direction: DIRECTIONS[0], skills: [], description: '', requirements: ['Мотивация учиться и расти'], conditions: ['Обсуждаются на собеседовании'],
  })
  const pc = (x: Partial<Company>) => setC((cur) => ({ ...cur, ...x }))
  const pj = (x: Partial<typeof job>) => setJob((cur) => ({ ...cur, ...x }))

  const next = () => {
    if (step === 0) {
      if (!c.name.trim() || !c.industry.trim()) return toast('Укажите название и отрасль')
      setJob((j) => ({ ...j, city: c.city }))
      return setStep(1)
    }
    if (!job.title.trim()) return toast('Укажите название вакансии')
    if (job.salaryTo < job.salaryFrom) return toast('Проверьте вилку зарплаты')
    if (!job.skills.length) return toast('Выберите хотя бы один навык')
    completeEmployerSetup({ ...c, name: c.name.trim() }, { ...job, title: job.title.trim(), description: job.description.trim() || 'Описание будет добавлено позже.' })
    nav('/plans', { replace: true })
  }

  return (
    <Wizard step={step} total={2} title={step === 0 ? 'О компании' : 'Первая вакансия'} subtitle={step === 0 ? 'Так вас увидят кандидаты' : 'Её используем для расчёта совместимости с кандидатами'} onNext={next} onBack={() => setStep(0)} nextLabel={step === 0 ? 'Далее' : 'Выбрать тариф'}>
      {step === 0 ? (
        <>
          <Field label="Название компании"><TextInput value={c.name} onChange={(e) => pc({ name: e.target.value })} /></Field>
          <Field label="Отрасль"><TextInput value={c.industry} onChange={(e) => pc({ industry: e.target.value })} placeholder="IT, ритейл, финтех…" /></Field>
          <Field label="Количество сотрудников"><TextInput type="number" inputMode="numeric" value={c.size || ''} onChange={(e) => pc({ size: Number(e.target.value) })} /></Field>
          <Field label="Город"><Select value={c.city} onChange={(e) => pc({ city: e.target.value })}>{CITIES.map((x) => <option key={x}>{x}</option>)}</Select></Field>
          <Field label="Сайт"><TextInput type="url" value={c.website} onChange={(e) => pc({ website: e.target.value })} placeholder="https://" /></Field>
          <Field label="Описание"><TextArea value={c.description} onChange={(e) => pc({ description: e.target.value })} /></Field>
        </>
      ) : (
        <>
          <Field label="Название вакансии"><TextInput value={job.title} onChange={(e) => pj({ title: e.target.value })} placeholder="Junior Product Designer" /></Field>
          <Field label="Направление"><Select value={job.direction} onChange={(e) => pj({ direction: e.target.value })}>{DIRECTIONS.map((d) => <option key={d}>{d}</option>)}</Select></Field>
          <Field label="Город"><Select value={job.city} onChange={(e) => pj({ city: e.target.value })}>{CITIES.map((x) => <option key={x}>{x}</option>)}</Select></Field>
          <Field label="Формат"><Select value={job.format} onChange={(e) => pj({ format: e.target.value as WorkFormat })}>{Object.entries(FORMAT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select></Field>
          <Field label="Занятость"><Select value={job.employment} onChange={(e) => pj({ employment: e.target.value as Employment })}>{Object.entries(EMPLOYMENT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Зарплата от, тыс. ₽"><TextInput type="number" inputMode="numeric" value={job.salaryFrom} onChange={(e) => pj({ salaryFrom: Number(e.target.value) })} /></Field>
            <Field label="до, тыс. ₽"><TextInput type="number" inputMode="numeric" value={job.salaryTo} onChange={(e) => pj({ salaryTo: Number(e.target.value) })} /></Field>
          </div>
          <Field label="Требуемый опыт (мес.)"><TextInput type="number" inputMode="numeric" value={job.expMonths} onChange={(e) => pj({ expMonths: Math.max(0, Number(e.target.value)) })} /></Field>
          <Field label="Нужные навыки"><ChipPicker options={ALL_SKILLS} value={job.skills} onChange={(skills) => pj({ skills })} allowCustom /></Field>
          <Field label="Описание"><TextArea value={job.description} onChange={(e) => pj({ description: e.target.value })} /></Field>
        </>
      )}
    </Wizard>
  )
}

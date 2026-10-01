import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ChipPicker, Field, Segmented, Select, TextArea, TextInput } from '../components/forms'
import { useToast } from '../components/Toast'
import { Button, PageHeader, Section } from '../components/ui'
import { useApp } from '../context/AppContext'
import { ALL_SKILLS, CITIES, DIRECTIONS } from '../data/jobs'
import { useMainButton } from '../integrations/telegram/useTelegram'
import type { Company, StudentProfile, WorkPref } from '../types'

export default function EditProfilePage() {
  const { role } = useApp()
  if (role === 'employer') return <EditCompany />
  return <EditStudent />
}

function EditStudent() {
  const nav = useNavigate()
  const toast = useToast()
  const { student, updateProfile } = useApp()
  const [p, setP] = useState<StudentProfile>(student!.profile)
  const patch = (x: Partial<StudentProfile>) => setP((c) => ({ ...c, ...x }))
  const valid = p.name.trim().length > 0

  const save = () => {
    if (!valid) return toast('Укажите имя')
    updateProfile({ ...p, name: p.name.trim() })
    toast('Профиль сохранён')
    nav(-1)
  }
  const native = useMainButton({ text: 'Сохранить', onClick: save })

  return (
    <>
      <PageHeader title="Редактировать профиль" />
      <div className="px-4 pb-8 space-y-3">
        <Section title="Основное" className="space-y-4">
          <Field label="Имя"><TextInput value={p.name} onChange={(e) => patch({ name: e.target.value })} autoComplete="name" /></Field>
          <Field label="Город">
            <Select value={p.city} onChange={(e) => patch({ city: e.target.value })}>
              {[...new Set([...CITIES, p.city])].filter(Boolean).map((c) => <option key={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="О себе"><TextArea value={p.about} onChange={(e) => patch({ about: e.target.value })} /></Field>
        </Section>

        <Section title="Образование" className="space-y-4">
          <Field label="Университет"><TextInput value={p.university} onChange={(e) => patch({ university: e.target.value })} /></Field>
          <Field label="Специальность"><TextInput value={p.major} onChange={(e) => patch({ major: e.target.value })} /></Field>
          <Field label="Год выпуска"><TextInput type="number" inputMode="numeric" value={p.gradYear || ''} onChange={(e) => patch({ gradYear: Number(e.target.value) })} /></Field>
        </Section>

        <Section title="Что ищу" className="space-y-4">
          <Field label="Желаемая должность"><TextInput value={p.desiredTitle} onChange={(e) => patch({ desiredTitle: e.target.value })} /></Field>
          <Field label="Направление">
            <Select value={p.direction} onChange={(e) => patch({ direction: e.target.value })}>
              {DIRECTIONS.map((d) => <option key={d}>{d}</option>)}
            </Select>
          </Field>
          <Field label="Зарплата от (тыс. ₽)"><TextInput type="number" inputMode="numeric" value={p.salary || ''} onChange={(e) => patch({ salary: Number(e.target.value) })} /></Field>
          <Field label="Формат работы">
            <Segmented<WorkPref>
              value={p.workFormat}
              onChange={(v) => patch({ workFormat: v })}
              options={[
                { value: 'any', label: 'Любой' },
                { value: 'office', label: 'Офис' },
                { value: 'hybrid', label: 'Гибрид' },
                { value: 'remote', label: 'Remote' },
              ]}
            />
          </Field>
        </Section>

        <Section title="Опыт и портфолио" className="space-y-4">
          <Field label="Опыт"><TextArea value={p.experience} onChange={(e) => patch({ experience: e.target.value })} placeholder="Стажировки, проекты, кейсы…" /></Field>
          <Field label="Опыт работы (месяцев)"><TextInput type="number" inputMode="numeric" value={p.experienceMonths} onChange={(e) => patch({ experienceMonths: Math.max(0, Number(e.target.value)) })} /></Field>
          <Field label="Портфолио (ссылка)"><TextInput type="url" value={p.portfolio} onChange={(e) => patch({ portfolio: e.target.value })} placeholder="https://" /></Field>
        </Section>

        <Section title="Навыки">
          <ChipPicker options={ALL_SKILLS} value={p.skills} onChange={(skills) => patch({ skills })} allowCustom />
        </Section>

        {!native && <Button full onClick={save}>Сохранить</Button>}
      </div>
    </>
  )
}

function EditCompany() {
  const nav = useNavigate()
  const toast = useToast()
  const { employer, updateCompany } = useApp()
  const [c, setC] = useState<Company>(employer!.company)
  const patch = (x: Partial<Company>) => setC((cur) => ({ ...cur, ...x }))

  const save = () => {
    if (!c.name.trim()) return toast('Укажите название')
    updateCompany({ ...c, name: c.name.trim() })
    toast('Профиль компании сохранён')
    nav(-1)
  }
  const native = useMainButton({ text: 'Сохранить', onClick: save })

  if (!employer) return <Navigate to="/home" replace />
  return (
    <>
      <PageHeader title="Профиль компании" />
      <div className="px-4 pb-8 space-y-3">
        <Section className="space-y-4">
          <Field label="Название"><TextInput value={c.name} onChange={(e) => patch({ name: e.target.value })} /></Field>
          <Field label="Описание"><TextArea value={c.description} onChange={(e) => patch({ description: e.target.value })} /></Field>
          <Field label="Отрасль"><TextInput value={c.industry} onChange={(e) => patch({ industry: e.target.value })} /></Field>
          <Field label="Количество сотрудников"><TextInput type="number" inputMode="numeric" value={c.size || ''} onChange={(e) => patch({ size: Number(e.target.value) })} /></Field>
          <Field label="Город"><TextInput value={c.city} onChange={(e) => patch({ city: e.target.value })} /></Field>
          <Field label="Сайт"><TextInput type="url" value={c.website} onChange={(e) => patch({ website: e.target.value })} placeholder="https://" /></Field>
        </Section>
        {!native && <Button full onClick={save}>Сохранить</Button>}
      </div>
    </>
  )
}

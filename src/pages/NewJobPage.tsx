import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ChipPicker, Field, Select, TextArea, TextInput } from '../components/forms'
import { useToast } from '../components/Toast'
import { Button, PageHeader, Section } from '../components/ui'
import { useApp } from '../context/AppContext'
import { ALL_SKILLS, CITIES, DIRECTIONS } from '../data/jobs'
import { useMainButton } from '../integrations/telegram/useTelegram'
import type { Employment, WorkFormat } from '../types'
import { EMPLOYMENT_LABEL, FORMAT_LABEL } from '../utils/format'

export default function NewJobPage() {
  const nav = useNavigate()
  const toast = useToast()
  const { role, employer, addJob } = useApp()
  const [title, setTitle] = useState('')
  const [city, setCity] = useState(employer?.company.city ?? CITIES[0])
  const [format, setFormat] = useState<WorkFormat>('hybrid')
  const [from, setFrom] = useState(60)
  const [to, setTo] = useState(90)
  const [employment, setEmployment] = useState<Employment>('full')
  const [direction, setDirection] = useState(DIRECTIONS[0])
  const [expMonths, setExp] = useState(0)
  const [skills, setSkills] = useState<string[]>([])
  const [description, setDescription] = useState('')

  const save = () => {
    if (!title.trim()) return toast('Укажите название вакансии')
    if (to < from) return toast('Проверьте вилку зарплаты')
    addJob({
      title: title.trim(),
      city,
      format,
      salaryFrom: from,
      salaryTo: to,
      expMonths,
      employment,
      direction,
      skills,
      description: description.trim() || 'Описание будет добавлено позже.',
      requirements: ['Мотивация учиться и расти'],
      conditions: ['Обсуждаются на собеседовании'],
    })
    toast('Вакансия опубликована')
    nav('/profile', { replace: true })
  }
  const native = useMainButton({ text: 'Опубликовать', onClick: save })

  if (role !== 'employer') return <Navigate to="/home" replace />

  return (
    <>
      <PageHeader title="Новая вакансия" />
      <div className="px-4 pb-8 space-y-3">
        <Section className="space-y-4">
          <Field label="Название"><TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Junior Product Designer" /></Field>
          <Field label="Город">
            <Select value={city} onChange={(e) => setCity(e.target.value)}>{CITIES.map((c) => <option key={c}>{c}</option>)}</Select>
          </Field>
          <Field label="Формат">
            <Select value={format} onChange={(e) => setFormat(e.target.value as WorkFormat)}>
              {Object.entries(FORMAT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Зарплата от, тыс. ₽"><TextInput type="number" inputMode="numeric" value={from} onChange={(e) => setFrom(Number(e.target.value))} /></Field>
            <Field label="до, тыс. ₽"><TextInput type="number" inputMode="numeric" value={to} onChange={(e) => setTo(Number(e.target.value))} /></Field>
          </div>
          <Field label="Тип занятости">
            <Select value={employment} onChange={(e) => setEmployment(e.target.value as Employment)}>
              {Object.entries(EMPLOYMENT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </Field>
          <Field label="Направление">
            <Select value={direction} onChange={(e) => setDirection(e.target.value)}>{DIRECTIONS.map((d) => <option key={d}>{d}</option>)}</Select>
          </Field>
          <Field label="Требуемый опыт (мес.)"><TextInput type="number" inputMode="numeric" value={expMonths} onChange={(e) => setExp(Math.max(0, Number(e.target.value)))} /></Field>
          <Field label="Описание"><TextArea value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
        </Section>
        <Section title="Навыки"><ChipPicker options={ALL_SKILLS} value={skills} onChange={setSkills} allowCustom /></Section>
        {!native && <Button full onClick={save}>Опубликовать</Button>}
      </div>
    </>
  )
}

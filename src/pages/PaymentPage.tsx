import { FlaskConical, Lock } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Field, TextInput } from '../components/forms'
import { useToast } from '../components/Toast'
import { Button, PageHeader, Section } from '../components/ui'
import { useApp } from '../context/AppContext'
import { formatPrice, PLANS } from '../services/plans'
import type { Plan } from '../types'

const digits = (s: string) => s.replace(/\D/g, '')

export default function PaymentPage() {
  const nav = useNavigate()
  const toast = useToast()
  const [sp] = useSearchParams()
  const { role, setPlan } = useApp()
  const planId = sp.get('plan') as Plan | null
  const plan = planId && planId !== 'free' ? PLANS[planId] : null

  const [email, setEmail] = useState('')
  const [number, setNumber] = useState('')
  const [holder, setHolder] = useState('')
  const [exp, setExp] = useState('')
  const [cvc, setCvc] = useState('')
  const [busy, setBusy] = useState(false)

  if (role !== 'employer' || !plan) return <Navigate to="/plans" replace />

  const pay = (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast('Проверьте email')
    if (digits(number).length !== 16) return toast('Номер карты — 16 цифр')
    if (!holder.trim()) return toast('Укажите имя держателя')
    if (digits(exp).length !== 4) return toast('Срок действия: ММ/ГГ')
    if (digits(cvc).length !== 3) return toast('CVC — 3 цифры')
    setBusy(true)
    // ТЕСТОВАЯ ОПЛАТА: ничего никуда не отправляется и не сохраняется.
    window.setTimeout(() => {
      setPlan(plan.id)
      toast(`Тариф ${plan.name} активирован (тест)`)
      nav('/home', { replace: true })
    }, 1300)
  }

  return (
    <div className="mx-auto max-w-xl min-h-full">
      <PageHeader title="Оплата" />
      <form onSubmit={pay} className="px-4 pb-10 space-y-3">
        <div className="flex gap-3 rounded-2xl p-3.5 text-sm" style={{ background: 'color-mix(in srgb, var(--c-warn) 16%, transparent)', color: 'var(--c-text)' }}>
          <FlaskConical size={20} className="shrink-0" style={{ color: 'var(--c-warn)' }} />
          <div><b>ТЕСТОВЫЙ ОБРАЗЕЦ.</b> Это демонстрация формы оплаты: деньги не списываются, данные карты никуда не отправляются и не сохраняются. Введите любые данные, например карту 4242 4242 4242 4242.</div>
        </div>

        <Section>
          <div className="flex items-baseline justify-between">
            <div><div className="text-xs text-hint">Тариф</div><div className="text-lg font-extrabold">{plan.name}</div></div>
            <div className="text-right"><div className="text-2xl font-black">{formatPrice(plan.price)}</div><div className="text-xs text-hint">в месяц</div></div>
          </div>
        </Section>

        <Section title="Данные карты (тест)" className="space-y-4">
          <Field label="Email для чека"><TextInput type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" /></Field>
          <Field label="Номер карты"><TextInput inputMode="numeric" autoComplete="off" value={number} onChange={(e) => setNumber(digits(e.target.value).slice(0, 16).replace(/(.{4})/g, '$1 ').trim())} placeholder="4242 4242 4242 4242" /></Field>
          <Field label="Имя держателя"><TextInput autoComplete="off" value={holder} onChange={(e) => setHolder(e.target.value.toUpperCase())} placeholder="IVAN IVANOV" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Срок (ММ/ГГ)"><TextInput inputMode="numeric" autoComplete="off" value={exp} onChange={(e) => { const d = digits(e.target.value).slice(0, 4); setExp(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d) }} placeholder="12/30" /></Field>
            <Field label="CVC"><TextInput inputMode="numeric" type="password" autoComplete="off" value={cvc} onChange={(e) => setCvc(digits(e.target.value).slice(0, 3))} placeholder="123" /></Field>
          </div>
        </Section>

        <Button type="submit" full disabled={busy} className="h-14 text-base">
          <Lock size={18} /> {busy ? 'Обработка…' : `Оплатить ${formatPrice(plan.price)} (тест)`}
        </Button>
      </form>
    </div>
  )
}

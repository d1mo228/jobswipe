import { Check, Sparkles } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button, PageHeader, cx } from '../components/ui'
import { useToast } from '../components/Toast'
import { useApp } from '../context/AppContext'
import { formatPrice, PLAN_ORDER, PLANS } from '../services/plans'
import type { Plan } from '../types'

export default function PlansPage() {
  const nav = useNavigate()
  const toast = useToast()
  const { role, employer, setPlan } = useApp()
  if (role !== 'employer' || !employer) return <Navigate to="/home" replace />
  const current = employer.plan

  const choose = (id: Plan) => {
    if (id === 'free') {
      setPlan('free')
      toast('Тариф Free активирован')
      return nav('/home', { replace: true })
    }
    nav(`/payment?plan=${id}`)
  }

  return (
    <div className="mx-auto max-w-xl min-h-full">
      <PageHeader title="Выберите тариф" back={current !== null} />
      <div className="px-4 pb-10 space-y-3">
        <p className="text-sm text-hint">Для студентов JobSwipe полностью бесплатен. Тарифы — только для работодателей: они определяют, сколько анкет кандидатов можно открыть за день.</p>
        {PLAN_ORDER.map((id) => {
          const p = PLANS[id]
          const active = current === id
          return (
            <div key={id} className={cx('bg-surface rounded-3xl p-5 shadow-soft border-2', id === 'pro' ? 'border-accent' : 'border-transparent')}>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold">{p.name}</h2>
                {id === 'pro' && <span className="text-xs font-bold bg-accent text-accent-ink rounded-full px-2.5 py-1 flex items-center gap-1"><Sparkles size={12} /> Популярный</span>}
                {active && <span className="text-xs font-bold text-good ml-auto">Текущий</span>}
              </div>
              <div className="mt-1"><span className="text-3xl font-black">{formatPrice(p.price)}</span><span className="text-hint"> / мес</span></div>
              <ul className="mt-3 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[15px]"><Check size={18} className="text-good shrink-0 mt-0.5" />{f}</li>
                ))}
              </ul>
              <Button full className="mt-4" variant={id === 'free' ? 'secondary' : 'primary'} disabled={active} onClick={() => choose(id)}>
                {active ? 'Активен' : id === 'free' ? 'Начать бесплатно' : `Выбрать ${p.name}`}
              </Button>
            </div>
          )
        })}
        <p className="text-xs text-hint text-center">Free открывает платформу сразу, без оплаты. Pro и Max оформляются на странице оплаты.</p>
      </div>
    </div>
  )
}

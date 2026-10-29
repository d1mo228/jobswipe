import type { Plan } from '../types'

export interface PlanInfo {
  id: Plan
  name: string
  /** ₽ в месяц */
  price: number
  /** сколько анкет можно открыть в день; null = без ограничений */
  dailyLimit: number | null
  features: string[]
}

export const PLANS: Record<Plan, PlanInfo> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    dailyLimit: 5,
    features: ['5 анкет кандидатов в день', 'Список с процентом совместимости', 'Фильтры по анкетам', 'Чаты после Match'],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 2500,
    dailyLimit: 20,
    features: ['20 анкет кандидатов в день', 'Фильтры по анкетам', 'Чаты после Match'],
  },
  max: {
    id: 'max',
    name: 'Max',
    price: 15000,
    dailyLimit: null,
    features: ['Безлимитный просмотр анкет', 'Фильтры по анкетам', 'Чаты после Match'],
  },
}

export const PLAN_ORDER: Plan[] = ['free', 'pro', 'max']

export const formatPrice = (n: number) => (n === 0 ? '0 ₽' : `${n.toLocaleString('ru-RU')} ₽`)

/** Ключ текущих суток (по локальному времени) — лимит просмотров обнуляется в полночь. */
export const todayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

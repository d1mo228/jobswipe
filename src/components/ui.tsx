import { ArrowLeft } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTelegram } from '../integrations/telegram/useTelegram'
import { initials, scoreColor } from '../utils/format'

export function cx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(' ')
}

const AVATAR_GRADIENTS = [
  ['#7d76ff', '#4b43e6'],
  ['#38bdf8', '#2563eb'],
  ['#34d399', '#059669'],
  ['#fbbf24', '#ea580c'],
  ['#f472b6', '#be185d'],
  ['#a78bfa', '#6d28d9'],
]
const gradFor = (s: string) => {
  const [a, b] = AVATAR_GRADIENTS[[...s].reduce((x, c) => x + c.charCodeAt(0), 0) % AVATAR_GRADIENTS.length]
  return `linear-gradient(135deg, ${a}, ${b})`
}

export function Avatar({ name, src, size = 48, ring = false }: { name: string; src?: string; size?: number; ring?: boolean }) {
  const ringCls = ring ? 'ring-2 ring-surface shadow-soft' : ''
  if (src) {
    return <img src={src} alt={name} width={size} height={size} className={cx('rounded-full object-cover shrink-0', ringCls)} style={{ width: size, height: size }} />
  }
  return (
    <div
      className={cx('rounded-full flex items-center justify-center text-white font-bold shrink-0 font-display', ringCls)}
      style={{ width: size, height: size, background: gradFor(name), fontSize: size * 0.36 }}
      aria-label={name}
    >
      {initials(name) || '·'}
    </div>
  )
}

export function CompanyLogo({ name, color, size = 48, src }: { name: string; color: string; size?: number; src?: string }) {
  const radius = size * 0.3
  if (src) {
    return <img src={src} alt={name} className="object-cover shrink-0" style={{ width: size, height: size, borderRadius: radius }} />
  }
  return (
    <div
      className="flex items-center justify-center text-white font-extrabold shrink-0 font-display"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: `linear-gradient(135deg, color-mix(in srgb, ${color} 80%, #fff), ${color})`,
        boxShadow: `0 8px 18px -8px ${color}`,
        fontSize: size * 0.44,
      }}
      aria-label={name}
    >
      {(name[0] ?? '·').toUpperCase()}
    </div>
  )
}

export function Badge({ children, tone = 'neutral', className }: { children: ReactNode; tone?: 'neutral' | 'accent' | 'good' | 'outline'; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
        tone === 'accent' && 'bg-accent-soft text-accent',
        tone === 'neutral' && 'bg-surface2 text-ink/80',
        tone === 'outline' && 'border border-line text-hint',
        tone === 'good' && 'text-good',
        className,
      )}
      style={tone === 'good' ? { background: 'color-mix(in srgb, var(--c-good) 14%, transparent)' } : undefined}
    >
      {children}
    </span>
  )
}

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  full?: boolean
}
export function Button({ variant = 'primary', full, className, ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-2xl px-5 h-12 font-semibold text-[15px] transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
        variant === 'primary' && 'btn-primary text-accent-ink hover:brightness-105',
        variant === 'secondary' && 'bg-accent-soft text-accent hover:brightness-95',
        variant === 'ghost' && 'bg-surface text-ink border border-line hover:bg-surface2',
        variant === 'danger' && 'bg-surface text-bad border border-line',
        full && 'w-full',
        className,
      )}
    />
  )
}

export function ScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const stroke = Math.max(4, size * 0.09)
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const color = scoreColor(score)
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} aria-label={`Совместимость ${score}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--c-line)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} style={{ transition: 'stroke-dashoffset .6s ease' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-display font-extrabold" style={{ fontSize: size * 0.3 }}>
        {score}
        <span className="font-semibold text-hint" style={{ fontSize: size * 0.17, marginTop: -size * 0.08 }}>%</span>
      </div>
    </div>
  )
}

export function Wordmark({ size = 20 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2 font-display font-extrabold tracking-tight" style={{ fontSize: size }}>
      <img src="./icons/icon.svg" alt="" style={{ width: size * 1.35, height: size * 1.35 }} className="rounded-[28%]" />
      <span>Job<span className="text-accent">Swipe</span></span>
    </div>
  )
}

/** Шапка страницы. В Telegram стрелка «назад» скрыта — там нативная Back Button. */
export function PageHeader({ title, right, back = true }: { title?: ReactNode; right?: ReactNode; back?: boolean }) {
  const nav = useNavigate()
  const { isTelegram } = useTelegram()
  const goBack = () => (window.history.state?.idx > 0 ? nav(-1) : nav('/home', { replace: true }))
  return (
    <header className="sticky top-0 z-20 glass pt-safe border-b border-line/60">
      <div className="flex items-center gap-2 h-14 px-4">
        {back && !isTelegram && (
          <button onClick={goBack} aria-label="Назад" className="-ml-1 w-10 h-10 rounded-full bg-surface border border-line flex items-center justify-center active:scale-95 transition">
            <ArrowLeft size={18} />
          </button>
        )}
        <h1 className="text-[19px] font-extrabold flex-1 truncate">{title}</h1>
        {right}
      </div>
    </header>
  )
}

export function EmptyState({ icon, title, text, children }: { icon: ReactNode; title: string; text?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center px-8 py-14 gap-3 rise">
      <div className="w-16 h-16 rounded-3xl bg-accent-soft text-accent flex items-center justify-center rotate-3">{icon}</div>
      <h2 className="text-xl font-extrabold">{title}</h2>
      {text && <p className="text-hint text-sm max-w-xs">{text}</p>}
      <div className="flex flex-col gap-2 mt-2 w-full max-w-xs">{children}</div>
    </div>
  )
}

export function Section({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cx('bg-surface rounded-[22px] p-4 border border-line/70 shadow-soft', className)}>
      {title && <h3 className="eyebrow mb-3 !font-sans">{title}</h3>}
      {children}
    </section>
  )
}

export function InfoRow({ icon, label, value }: { icon?: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2">
      {icon && <div className="w-8 h-8 rounded-xl bg-surface2 text-hint flex items-center justify-center shrink-0">{icon}</div>}
      <div className="min-w-0 self-center">
        <div className="text-[11px] uppercase tracking-wider font-semibold text-hint">{label}</div>
        <div className="text-[15px] break-words">{value || <span className="text-hint">—</span>}</div>
      </div>
    </div>
  )
}

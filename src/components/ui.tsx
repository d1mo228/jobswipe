import { ArrowLeft } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTelegram } from '../integrations/telegram/useTelegram'
import { initials, scoreColor } from '../utils/format'

export function cx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(' ')
}

const AVATAR_COLORS = ['#635bff', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6']
const colorFor = (s: string) => AVATAR_COLORS[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length]

export function Avatar({ name, src, size = 48 }: { name: string; src?: string; size?: number }) {
  if (src) {
    return <img src={src} alt={name} width={size} height={size} className="rounded-full object-cover shrink-0" style={{ width: size, height: size }} />
  }
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-semibold shrink-0"
      style={{ width: size, height: size, background: colorFor(name), fontSize: size * 0.36 }}
      aria-label={name}
    >
      {initials(name)}
    </div>
  )
}

export function CompanyLogo({ name, color, size = 48 }: { name: string; color: string; size?: number }) {
  return (
    <div
      className="flex items-center justify-center text-white font-bold shrink-0"
      style={{ width: size, height: size, background: color, borderRadius: size * 0.28, fontSize: size * 0.42 }}
      aria-label={name}
    >
      {name[0]}
    </div>
  )
}

export function Badge({ children, tone = 'neutral', className }: { children: ReactNode; tone?: 'neutral' | 'accent' | 'good'; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap',
        tone === 'accent' && 'bg-accent-soft text-accent',
        tone === 'neutral' && 'bg-surface2 text-ink',
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
        variant === 'primary' && 'bg-accent text-accent-ink shadow-soft hover:brightness-110',
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
  const r = (size - 8) / 2
  const c = 2 * Math.PI * r
  const color = scoreColor(score)
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--c-line)" strokeWidth={6} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-bold" style={{ fontSize: size * 0.28 }}>
        {score}%
      </div>
    </div>
  )
}

/** Шапка страницы. В Telegram стрелка «назад» скрыта — там нативная Back Button. */
export function PageHeader({ title, right, back = true }: { title?: ReactNode; right?: ReactNode; back?: boolean }) {
  const nav = useNavigate()
  const { isTelegram } = useTelegram()
  const goBack = () => (window.history.state?.idx > 0 ? nav(-1) : nav('/home', { replace: true }))
  return (
    <header className="sticky top-0 z-20 bg-bg/90 backdrop-blur pt-safe">
      <div className="flex items-center gap-2 h-14 px-4">
        {back && !isTelegram && (
          <button onClick={goBack} aria-label="Назад" className="-ml-2 w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface2 active:scale-95">
            <ArrowLeft size={22} />
          </button>
        )}
        <h1 className="text-lg font-bold flex-1 truncate">{title}</h1>
        {right}
      </div>
    </header>
  )
}

export function EmptyState({ icon, title, text, children }: { icon: ReactNode; title: string; text?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center px-8 py-14 gap-3">
      <div className="w-16 h-16 rounded-full bg-accent-soft text-accent flex items-center justify-center">{icon}</div>
      <h2 className="text-lg font-bold">{title}</h2>
      {text && <p className="text-hint text-sm max-w-xs">{text}</p>}
      <div className="flex flex-col gap-2 mt-2 w-full max-w-xs">{children}</div>
    </div>
  )
}

export function Section({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cx('bg-surface rounded-3xl p-4 shadow-soft', className)}>
      {title && <h3 className="text-xs uppercase tracking-wide font-semibold text-hint mb-3">{title}</h3>}
      {children}
    </section>
  )
}

export function InfoRow({ icon, label, value }: { icon?: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2">
      {icon && <div className="text-hint mt-0.5">{icon}</div>}
      <div className="min-w-0">
        <div className="text-xs text-hint">{label}</div>
        <div className="text-[15px] break-words">{value || <span className="text-hint">—</span>}</div>
      </div>
    </div>
  )
}

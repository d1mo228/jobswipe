import { Plus, X } from 'lucide-react'
import { useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cx } from './ui'

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-xs text-hint mt-1">{hint}</span>}
    </label>
  )
}

const inputCls =
  'w-full rounded-2xl bg-surface border border-line px-4 h-12 text-ink placeholder:text-hint outline-none focus:border-accent focus:ring-2 focus:ring-accent/20'

export const TextInput = (p: InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={cx(inputCls, p.className)} />
export const TextArea = (p: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...p} className={cx(inputCls, 'h-auto py-3 min-h-24 resize-none', p.className)} />
)
export const Select = (p: SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={cx(inputCls, 'appearance-none', p.className)} />

/** Выбор нескольких значений из списка + возможность добавить своё. */
export function ChipPicker({
  options,
  value,
  onChange,
  allowCustom = false,
}: {
  options: string[]
  value: string[]
  onChange: (v: string[]) => void
  allowCustom?: boolean
}) {
  const [custom, setCustom] = useState('')
  const all = [...new Set([...options, ...value])]
  const toggle = (s: string) => onChange(value.includes(s) ? value.filter((x) => x !== s) : [...value, s])
  const add = () => {
    const v = custom.trim()
    if (!v) return
    if (!value.includes(v)) onChange([...value, v])
    setCustom('')
  }
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {all.map((s) => {
          const on = value.includes(s)
          return (
            <button
              type="button"
              key={s}
              onClick={() => toggle(s)}
              className={cx(
                'rounded-full px-3 py-1.5 text-sm font-medium border transition',
                on ? 'bg-accent text-accent-ink border-accent' : 'bg-surface text-ink border-line hover:bg-surface2',
              )}
            >
              {s}
              {on && value.includes(s) && !options.includes(s) && <X size={12} className="inline ml-1" />}
            </button>
          )
        })}
      </div>
      {allowCustom && (
        <div className="flex gap-2 mt-3">
          <TextInput
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
            placeholder="Свой навык…"
          />
          <button type="button" onClick={add} aria-label="Добавить" className="w-12 h-12 shrink-0 rounded-2xl bg-accent-soft text-accent flex items-center justify-center">
            <Plus size={20} />
          </button>
        </div>
      )}
    </div>
  )
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="flex bg-surface2 rounded-2xl p-1 gap-1">
      {options.map((o) => (
        <button
          type="button"
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cx(
            'flex-1 h-10 rounded-xl text-sm font-medium transition',
            value === o.value ? 'bg-surface shadow-soft text-ink' : 'text-hint',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="w-full flex items-center justify-between h-12">
      <span className="text-[15px] font-medium">{label}</span>
      <span className={cx('w-12 h-7 rounded-full p-0.5 transition', checked ? 'bg-accent' : 'bg-surface2')}>
        <span className={cx('block w-6 h-6 rounded-full bg-white shadow transition-transform', checked && 'translate-x-5')} />
      </span>
    </button>
  )
}

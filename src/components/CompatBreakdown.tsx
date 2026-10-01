import { Check, Minus, X } from 'lucide-react'
import type { Compatibility } from '../types'
import { ScoreRing } from './ui'

const ICON = {
  ok: <Check size={16} style={{ color: 'var(--c-good)' }} />,
  partial: <Minus size={16} style={{ color: 'var(--c-warn)' }} />,
  bad: <X size={16} style={{ color: 'var(--c-bad)' }} />,
}

export function CompatBreakdown({ compat }: { compat: Compatibility }) {
  return (
    <div>
      <div className="flex items-center gap-4 mb-3">
        <ScoreRing score={compat.score} size={72} />
        <div>
          <div className="text-xl font-extrabold">{compat.score}% совместимость</div>
          <div className="text-xs text-hint">Предварительная оценка по профилю</div>
        </div>
      </div>
      <ul className="divide-y divide-line">
        {compat.items.map((it) => (
          <li key={it.key} className="flex items-center gap-3 py-2.5">
            <span className="w-7 h-7 rounded-full bg-surface2 flex items-center justify-center">{ICON[it.status]}</span>
            <span className="font-medium text-[15px]">{it.label}</span>
            <span className="ml-auto text-xs text-hint text-right">{it.hint}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

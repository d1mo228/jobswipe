import { Briefcase, Check, MapPin } from 'lucide-react'
import { Badge, CompanyLogo, ScoreRing } from './ui'
import type { Company, Compatibility, Job } from '../types'
import { EMPLOYMENT_LABEL, experienceLabel, locationLabel } from '../utils/format'

/** Карточка вакансии для свайпа. */
export function JobCard({ job, company, compat, mySkills }: { job: Job; company: Company; compat: Compatibility; mySkills: string[] }) {
  const have = new Set(mySkills.map((s) => s.toLowerCase()))
  const skillsNote = compat.items.find((i) => i.key === 'skills')?.hint
  return (
    <div className="h-full w-full bg-surface rounded-[30px] border border-line/70 shadow-card overflow-hidden flex flex-col">
      {/* Шапка в цвете компании */}
      <div
        className="relative px-6 pt-6 pb-5"
        style={{ background: `linear-gradient(165deg, color-mix(in srgb, ${company.logoColor} 22%, var(--c-surface)) 0%, var(--c-surface) 100%)` }}
      >
        <div className="flex items-center gap-3">
          <CompanyLogo src={company.logoUrl} name={company.name} color={company.logoColor} size={52} />
          <div className="min-w-0">
            <div className="font-display font-extrabold text-[15px] truncate">{company.name}</div>
            <div className="text-xs text-hint truncate">{company.industry} · {company.size} чел.</div>
          </div>
          <div className="ml-auto"><ScoreRing score={compat.score} size={56} /></div>
        </div>
        <h2 className="mt-5 text-[28px] leading-[1.08] font-extrabold">{job.title}</h2>
      </div>

      <div className="flex-1 min-h-0 px-6 pt-5 pb-6 flex flex-col">
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-[32px] font-extrabold leading-none">{job.salaryFrom}–{job.salaryTo}</span>
          <span className="text-sm text-hint font-medium">тыс. ₽ / мес</span>
        </div>

        <div className="mt-3 space-y-2 text-[14.5px]">
          <div className="flex items-center gap-2.5"><MapPin size={16} className="text-accent shrink-0" />{locationLabel(job)}</div>
          <div className="flex items-center gap-2.5"><Briefcase size={16} className="text-accent shrink-0" />{experienceLabel(job.expMonths)} · {EMPLOYMENT_LABEL[job.employment]}</div>
        </div>

        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="eyebrow">Навыки</span>
            {skillsNote && <span className="text-xs text-hint">{skillsNote}</span>}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {job.skills.map((s) => {
              const ok = have.has(s.toLowerCase())
              return (
                <Badge key={s} tone={ok ? 'accent' : 'outline'}>
                  {ok && <Check size={12} strokeWidth={3} />}
                  {s}
                </Badge>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

import { Briefcase, Building2, GraduationCap, MapPin, Wallet } from 'lucide-react'
import { ScoreRing, Badge, CompanyLogo, Avatar } from './ui'
import type { Candidate, Company, Compatibility, Job } from '../types'
import { companySizeLabel, experienceLabel, locationLabel, salaryLabel, WORKPREF_LABEL } from '../utils/format'

const shell = 'h-full w-full bg-surface rounded-[28px] shadow-card border border-line p-6 flex flex-col overflow-hidden'

export function JobCard({ job, company, compat, mySkills }: { job: Job; company: Company; compat: Compatibility; mySkills: string[] }) {
  const have = new Set(mySkills.map((s) => s.toLowerCase()))
  return (
    <div className={shell}>
      <div className="flex flex-col items-center text-center gap-3 mt-1">
        <CompanyLogo name={company.name} color={company.logoColor} size={64} />
        <div className="text-sm font-semibold tracking-[0.2em] uppercase text-hint">{company.name}</div>
        <h2 className="text-2xl font-extrabold leading-tight">{job.title}</h2>
      </div>

      <div className="mt-5 space-y-2.5 text-[15px]">
        <div className="flex items-center gap-2.5"><MapPin size={18} className="text-accent shrink-0" />{locationLabel(job)}</div>
        <div className="flex items-center gap-2.5"><Wallet size={18} className="text-accent shrink-0" />{salaryLabel(job)}</div>
        <div className="flex items-center gap-2.5"><Briefcase size={18} className="text-accent shrink-0" />{experienceLabel(job.expMonths)}</div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {job.skills.map((s) => (
          <Badge key={s} tone={have.has(s.toLowerCase()) ? 'accent' : 'neutral'}>{s}</Badge>
        ))}
      </div>

      <div className="mt-auto pt-4 flex items-center gap-4">
        <ScoreRing score={compat.score} size={64} />
        <div>
          <div className="text-xs text-hint">Совместимость</div>
          <div className="font-bold">{compat.score}%</div>
        </div>
        <div className="ml-auto text-right min-w-0">
          <div className="text-xs text-hint">Компания</div>
          <div className="text-sm font-medium flex items-center gap-1.5 justify-end"><Building2 size={14} className="shrink-0" /><span className="truncate">{company.industry} / {companySizeLabel(company.size)}</span></div>
        </div>
      </div>
    </div>
  )
}

export function CandidateCard({ c, compat, jobSkills }: { c: Candidate; compat: Compatibility; jobSkills: string[] }) {
  const need = new Set(jobSkills.map((s) => s.toLowerCase()))
  return (
    <div className={shell}>
      <div className="flex flex-col items-center text-center gap-3 mt-1">
        <Avatar name={c.name} src={c.photoUrl} size={72} />
        <div className="text-sm font-semibold text-hint">{c.name}</div>
        <h2 className="text-2xl font-extrabold leading-tight">{c.desiredTitle}</h2>
      </div>

      <div className="mt-5 space-y-2.5 text-[15px]">
        <div className="flex items-center gap-2.5"><GraduationCap size={18} className="text-accent shrink-0" /><span>{c.university}, {c.gradYear}</span></div>
        <div className="flex items-center gap-2.5"><MapPin size={18} className="text-accent shrink-0" />{c.city} · {WORKPREF_LABEL[c.workFormat]}</div>
        <div className="flex items-center gap-2.5"><Wallet size={18} className="text-accent shrink-0" />от {c.salary} тыс. ₽</div>
      </div>

      <p className="mt-3 text-sm text-hint line-clamp-2">{c.experience}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {c.skills.map((s) => (
          <Badge key={s} tone={need.has(s.toLowerCase()) ? 'accent' : 'neutral'}>{s}</Badge>
        ))}
      </div>

      <div className="mt-auto pt-4 flex items-center gap-4">
        <ScoreRing score={compat.score} size={64} />
        <div>
          <div className="text-xs text-hint">Совместимость</div>
          <div className="font-bold">{compat.score}%</div>
        </div>
        <div className="ml-auto text-right text-sm text-hint max-w-[45%] truncate">{c.major}</div>
      </div>
    </div>
  )
}

import { Building2, ChevronRight, Heart, Share2 } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { CompatBreakdown } from '../components/CompatBreakdown'
import { MatchOverlay } from '../components/MatchOverlay'
import { useToast } from '../components/Toast'
import { Avatar, Badge, Button, CompanyLogo, InfoRow, PageHeader, Section } from '../components/ui'
import { useApp } from '../context/AppContext'
import { useMainButton } from '../integrations/telegram/useTelegram'
import { calculateCompatibility } from '../services/matching'
import { mockApi } from '../services/mockApi'
import type { Match } from '../types'
import { EMPLOYMENT_LABEL, experienceLabel, locationLabel, salaryLabel } from '../utils/format'
import { shareJob } from '../utils/share'

export default function JobPage() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const toast = useToast()
  const { role, student, employer, swipeJob } = useApp()
  const [match, setMatch] = useState<Match | null>(null)

  const job = mockApi.getJob(id) ?? employer?.jobs.find((j) => j.id === id)
  const company = job ? (employer?.company.id === job.companyId ? employer.company : mockApi.getCompany(job.companyId)) : undefined

  const isStudent = role === 'student' && !!student
  const existing = student?.matches.find((m) => m.jobId === id)
  const liked = !!student?.likes.includes(id)

  const apply = () => {
    if (!job) return
    if (existing) return nav(`/chat/${existing.id}`)
    const m = swipeJob(job.id, 'like')
    if (m) setMatch(m)
    else toast('Отклик отправлен — ждём ответа работодателя')
  }

  const label = existing ? 'Открыть чат' : 'Откликнуться'
  const showAction = isStudent && (!liked || !!existing)
  const native = useMainButton({ text: label, onClick: apply, visible: showAction })

  if (!job || !company) return <Navigate to="/home" replace />

  const compat = isStudent ? calculateCompatibility(student!.profile, job) : null
  const share = async () => {
    const r = await shareJob(job.id, job.title, company.name)
    if (r === 'copied') toast('Ссылка скопирована')
  }

  return (
    <>
      <PageHeader
        title="Вакансия"
        right={
          <button onClick={share} aria-label="Поделиться вакансией" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface2">
            <Share2 size={20} />
          </button>
        }
      />
      <div className="px-4 pb-8 space-y-3">
        <Section className="space-y-3">
          <button onClick={() => nav(`/company/${company.id}`)} className="flex items-center gap-3 w-full text-left">
            <CompanyLogo name={company.name} color={company.logoColor} size={48} />
            <div className="min-w-0 flex-1">
              <div className="font-semibold">{company.name}</div>
              <div className="text-xs text-hint">{company.industry} · {company.size} сотрудников</div>
            </div>
            <ChevronRight size={18} className="text-hint" />
          </button>
          <h2 className="text-2xl font-extrabold leading-tight">{job.title}</h2>
          <div className="flex flex-wrap gap-2">
            <Badge tone="accent">{salaryLabel(job)}</Badge>
            <Badge>{locationLabel(job)}</Badge>
            <Badge>{EMPLOYMENT_LABEL[job.employment]}</Badge>
            <Badge>{experienceLabel(job.expMonths)}</Badge>
          </div>
        </Section>

        {compat && (
          <Section title="Совместимость с вашим профилем">
            <CompatBreakdown compat={compat} />
          </Section>
        )}

        <Section title="О вакансии">
          <p className="text-[15px] leading-relaxed">{job.description}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {job.skills.map((s) => <Badge key={s}>{s}</Badge>)}
          </div>
        </Section>

        <Section title="Требования">
          <ul className="list-disc pl-5 space-y-1 text-[15px]">{job.requirements.map((r) => <li key={r}>{r}</li>)}</ul>
        </Section>

        <Section title="Условия">
          <ul className="list-disc pl-5 space-y-1 text-[15px]">{job.conditions.map((r) => <li key={r}>{r}</li>)}</ul>
          <InfoRow icon={<Building2 size={18} />} label="Направление" value={job.direction} />
        </Section>

        <Button full variant="ghost" onClick={share}><Share2 size={18} /> Поделиться вакансией</Button>

        {showAction && !native && (
          <div className="sticky bottom-0 -mx-4 px-4 pt-3 pb-safe bg-bg/90 backdrop-blur" style={{ paddingBottom: 'calc(var(--safe-bottom) + 12px)' }}>
            <Button full onClick={apply}><Heart size={18} /> {label}</Button>
          </div>
        )}
        {isStudent && liked && !existing && <p className="text-center text-sm text-hint">Отклик отправлен — ждём ответа работодателя.</p>}
      </div>

      <MatchOverlay
        open={!!match}
        left={<Avatar name={student?.profile.name ?? ''} src={student?.profile.photoUrl} size={104} />}
        right={<CompanyLogo name={company.name} color={company.logoColor} size={104} />}
        text={`Вы и ${company.name} заинтересованы друг в друге.`}
        onChat={() => match && nav(`/chat/${match.id}`)}
        onContinue={() => setMatch(null)}
      />
    </>
  )
}

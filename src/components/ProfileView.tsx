import { Briefcase, Building2, ExternalLink, GraduationCap, Globe, MapPin, Wallet } from 'lucide-react'
import type { Company, Job, StudentProfile } from '../types'
import { companySizeLabel, salaryLabel, WORKPREF_LABEL, locationLabel } from '../utils/format'
import { Avatar, Badge, CompanyLogo, InfoRow, Section } from './ui'
import { useNavigate } from 'react-router-dom'

export function StudentProfileView({ p, showUsername }: { p: StudentProfile; showUsername: boolean }) {
  return (
    <div className="space-y-3">
      <Section className="flex flex-col items-center text-center gap-2 py-6">
        <Avatar name={p.name} src={p.photoUrl} size={88} />
        <h2 className="text-xl font-extrabold">{p.name}</h2>
        {showUsername && p.username && <div className="text-sm text-accent font-medium">@{p.username}</div>}
        <div className="text-hint">{p.desiredTitle}</div>
        {p.about && <p className="text-sm mt-1 max-w-sm">{p.about}</p>}
      </Section>

      <Section title="Образование">
        <InfoRow icon={<GraduationCap size={18} />} label="Университет" value={p.university} />
        <InfoRow label="Специальность" value={p.major} />
        <InfoRow label="Год выпуска" value={p.gradYear || ''} />
      </Section>

      <Section title="Работа">
        <InfoRow icon={<MapPin size={18} />} label="Город" value={p.city} />
        <InfoRow icon={<Briefcase size={18} />} label="Желаемая должность" value={p.desiredTitle} />
        <InfoRow icon={<Wallet size={18} />} label="Ожидаемая зарплата" value={p.salary ? `от ${p.salary} тыс. ₽` : ''} />
        <InfoRow label="Формат работы" value={WORKPREF_LABEL[p.workFormat]} />
        <InfoRow label="Опыт" value={p.experience} />
      </Section>

      <Section title="Навыки">
        <div className="flex flex-wrap gap-2">{p.skills.length ? p.skills.map((s) => <Badge key={s} tone="accent">{s}</Badge>) : <span className="text-hint text-sm">Не указаны</span>}</div>
      </Section>

      <Section title="Портфолио">
        {p.portfolio ? (
          <a href={p.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-accent font-medium break-all">
            <ExternalLink size={16} className="shrink-0" /> {p.portfolio}
          </a>
        ) : (
          <span className="text-hint text-sm">Не указано</span>
        )}
      </Section>
    </div>
  )
}

export function CompanyView({ company, jobs, canOpenJobs = true }: { company: Company; jobs: Job[]; canOpenJobs?: boolean }) {
  const nav = useNavigate()
  return (
    <div className="space-y-3">
      <Section className="flex flex-col items-center text-center gap-2 py-6">
        <CompanyLogo name={company.name} color={company.logoColor} size={80} />
        <h2 className="text-xl font-extrabold">{company.name}</h2>
        <div className="text-hint text-sm">{company.industry} · {companySizeLabel(company.size)}</div>
        <p className="text-sm mt-1 max-w-sm">{company.description}</p>
      </Section>

      <Section title="О компании">
        <InfoRow icon={<Building2 size={18} />} label="Отрасль" value={company.industry} />
        <InfoRow label="Размер" value={companySizeLabel(company.size)} />
        <InfoRow icon={<MapPin size={18} />} label="Город" value={company.city} />
        <InfoRow
          icon={<Globe size={18} />}
          label="Сайт"
          value={company.website ? <a href={company.website} target="_blank" rel="noreferrer" className="text-accent break-all">{company.website}</a> : ''}
        />
      </Section>

      <Section title={`Вакансии (${jobs.length})`}>
        {jobs.length === 0 && <span className="text-hint text-sm">Пока нет открытых вакансий</span>}
        <ul className="divide-y divide-line">
          {jobs.map((j) => (
            <li key={j.id}>
              <button disabled={!canOpenJobs} onClick={() => nav(`/job/${j.id}`)} className="w-full text-left py-3">
                <div className="font-semibold">{j.title}</div>
                <div className="text-sm text-hint">{locationLabel(j)} · {salaryLabel(j)}</div>
              </button>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  )
}

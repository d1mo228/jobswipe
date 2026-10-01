import { ChevronRight, Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Avatar, Badge, CompanyLogo, EmptyState, PageHeader } from '../components/ui'
import { useApp } from '../context/AppContext'
import { mockApi } from '../services/mockApi'
import { timeAgo } from '../utils/format'

export default function MatchesPage() {
  const nav = useNavigate()
  const { role, matches } = useApp()
  const list = [...matches].sort((a, b) => b.createdAt - a.createdAt)

  return (
    <>
      <PageHeader back={false} title="MATCHES" />
      {list.length === 0 ? (
        <EmptyState icon={<Heart size={28} />} title="Пока нет Match" text="Ставьте Like — когда интерес окажется взаимным, Match появится здесь." />
      ) : (
        <ul className="px-4 pb-6 space-y-3">
          {list.map((m) => {
            const job = mockApi.getJob(m.jobId)
            const company = mockApi.getCompany(m.companyId)
            const cand = mockApi.getCandidate(m.candidateId)
            const employer = role === 'employer'
            const title = employer ? (cand?.name ?? 'Кандидат') : (company?.name ?? '')
            return (
              <li key={m.id}>
                <button onClick={() => nav(`/chat/${m.id}`)} className="w-full bg-surface rounded-3xl p-4 shadow-soft flex items-center gap-4 text-left active:scale-[0.99] transition">
                  {employer ? (
                    <Avatar name={title} src={cand?.photoUrl} size={52} />
                  ) : (
                    company && <CompanyLogo name={company.name} color={company.logoColor} size={52} />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-bold truncate">{title}</div>
                    <div className="text-sm text-hint truncate">{job?.title}</div>
                    <div className="text-xs text-hint mt-1">Match · {timeAgo(m.createdAt)}</div>
                  </div>
                  {m.unread && <Badge tone="accent">Новое</Badge>}
                  <ChevronRight size={20} className="text-hint shrink-0" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}

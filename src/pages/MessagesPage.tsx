import { MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Avatar, CompanyLogo, EmptyState, PageHeader } from '../components/ui'
import { useApp } from '../context/AppContext'
import { mockApi } from '../services/mockApi'
import { timeAgo } from '../utils/format'

export default function MessagesPage() {
  const nav = useNavigate()
  const { role, matches, messages } = useApp()
  const employer = role === 'employer'

  const rows = matches
    .map((m) => {
      const list = messages[m.id] ?? []
      const last = list[list.length - 1]
      return { m, last, ts: last?.ts ?? m.createdAt }
    })
    .sort((a, b) => b.ts - a.ts)

  return (
    <>
      <PageHeader back={false} title="Чаты" />
      {rows.length === 0 ? (
        <EmptyState icon={<MessageCircle size={28} />} title="Чатов пока нет" text="Чат откроется после первого Match." />
      ) : (
        <ul className="px-4 pb-6 space-y-2">
          {rows.map(({ m, last, ts }) => {
            const company = mockApi.getCompany(m.companyId)
            const cand = mockApi.getCandidate(m.candidateId)
            const job = mockApi.getJob(m.jobId)
            const name = employer ? (cand?.name ?? 'Кандидат') : (company?.name ?? '')
            return (
              <li key={m.id}>
                <button onClick={() => nav(`/chat/${m.id}`)} className="w-full bg-surface rounded-2xl p-3.5 shadow-soft flex items-center gap-3 text-left active:scale-[0.99] transition">
                  {employer ? <Avatar name={name} src={cand?.photoUrl} size={48} /> : company && <CompanyLogo name={company.name} color={company.logoColor} size={48} />}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold truncate">{name}</span>
                      <span className="ml-auto text-xs text-hint shrink-0">{timeAgo(ts)}</span>
                    </div>
                    <div className="text-xs text-accent truncate">{job?.title}</div>
                    <div className={`text-sm truncate ${m.unread ? 'font-semibold' : 'text-hint'}`}>
                      {last ? `${last.from === 'me' ? 'Вы: ' : ''}${last.text}` : 'Новый Match — напишите первым!'}
                    </div>
                  </div>
                  {m.unread && <span className="w-2.5 h-2.5 rounded-full bg-accent shrink-0" aria-label="Непрочитано" />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}

import { Heart } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { CompatBreakdown } from '../components/CompatBreakdown'
import { MatchOverlay } from '../components/MatchOverlay'
import { StudentProfileView } from '../components/ProfileView'
import { Avatar, Button, CompanyLogo, PageHeader, Section } from '../components/ui'
import { useApp } from '../context/AppContext'
import { useMainButton } from '../integrations/telegram/useTelegram'
import { calculateCompatibility } from '../services/matching'
import { mockApi } from '../services/mockApi'
import type { Match } from '../types'

export default function CandidatePage() {
  const { id = '' } = useParams()
  const [sp] = useSearchParams()
  const nav = useNavigate()
  const { employer, swipeCandidate } = useApp()
  const [match, setMatch] = useState<Match | null>(null)

  const cand = mockApi.getCandidate(id)
  const job = employer?.jobs.find((j) => j.id === sp.get('job')) ?? employer?.jobs[0]
  const key = job && cand ? `${job.id}:${cand.id}` : ''
  const liked = !!employer && employer.likes.includes(key)
  const existing = employer?.matches.find((m) => m.jobId === job?.id && m.candidateId === id)

  const act = () => {
    if (!cand || !job) return
    if (existing) return nav(`/chat/${existing.id}`)
    const m = swipeCandidate(job.id, cand, 'like')
    if (m) setMatch(m)
  }
  const label = existing ? 'Открыть чат' : 'Лайк кандидату'
  const native = useMainButton({ text: label, onClick: act, visible: !liked || !!existing })

  if (!cand || !employer) return <Navigate to="/home" replace />

  return (
    <>
      <PageHeader title="Кандидат" />
      <div className="px-4 pb-8 space-y-3">
        <StudentProfileView p={cand} showUsername={false} />
        {job && (
          <Section title={`Совместимость · ${job.title}`}>
            <CompatBreakdown compat={calculateCompatibility(cand, job)} />
          </Section>
        )}
        {!native && (!liked || existing) && (
          <Button full onClick={act}><Heart size={18} /> {label}</Button>
        )}
        {liked && !existing && <p className="text-center text-sm text-hint">Вы уже поставили Like — ждём ответа кандидата.</p>}
      </div>
      <MatchOverlay
        open={!!match}
        left={<CompanyLogo name={employer.company.name} color={employer.company.logoColor} size={104} />}
        right={<Avatar name={cand.name} src={cand.photoUrl} size={104} />}
        text={`Вы и ${cand.name} заинтересованы друг в друге.`}
        onChat={() => match && nav(`/chat/${match.id}`)}
        onContinue={() => setMatch(null)}
      />
    </>
  )
}

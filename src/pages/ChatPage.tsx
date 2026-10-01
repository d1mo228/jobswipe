import { Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Avatar, CompanyLogo, PageHeader, cx } from '../components/ui'
import { useApp } from '../context/AppContext'
import { mockApi } from '../services/mockApi'
import { clockTime } from '../utils/format'

export default function ChatPage() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const { role, matches, messages, sendMessage, receiveMessage, markRead } = useApp()
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  const match = matches.find((m) => m.id === id)
  const list = messages[id] ?? []

  useEffect(() => {
    if (match?.unread) markRead(id)
  }, [match?.unread, list.length, id, markRead])

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [list.length, typing])

  if (!match) return <Navigate to="/messages" replace />

  const employer = role === 'employer'
  const company = mockApi.getCompany(match.companyId)
  const cand = mockApi.getCandidate(match.candidateId)
  const job = mockApi.getJob(match.jobId)
  const name = employer ? (cand?.name ?? 'Кандидат') : (company?.name ?? '')
  const open = () => nav(employer ? `/candidate/${match.candidateId}?job=${match.jobId}` : `/company/${match.companyId}`)

  const send = (e: React.FormEvent) => {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    sendMessage(id, t)
    setText('')
    // Mock-собеседник отвечает через 1–2 секунды (в реальном приложении здесь будет backend / WebSocket)
    const incoming = list.filter((m) => m.from === 'them').length
    setTyping(true)
    window.setTimeout(() => {
      receiveMessage(id, mockApi.getAutoReply(incoming, employer))
      setTyping(false)
    }, 1200 + Math.random() * 900)
  }

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: 'var(--app-height, 100dvh)' }}>
      <PageHeader
        title={
          <button onClick={open} className="flex items-center gap-3 min-w-0 text-left">
            {employer ? <Avatar name={name} src={cand?.photoUrl} size={36} /> : company && <CompanyLogo name={company.name} color={company.logoColor} size={36} />}
            <span className="min-w-0">
              <span className="block text-base font-bold leading-tight truncate">{name}</span>
              <span className="block text-xs font-normal text-hint truncate">{job?.title}</span>
            </span>
          </button>
        }
      />

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-2" aria-live="polite">
        {list.length === 0 && <p className="text-center text-sm text-hint py-8">У вас Match! Напишите первое сообщение 👋</p>}
        {list.map((m) => (
          <div key={m.id} className={cx('flex', m.from === 'me' ? 'justify-end' : 'justify-start')}>
            <div
              className={cx(
                'max-w-[80%] rounded-2xl px-4 py-2.5 text-[15px] break-words',
                m.from === 'me' ? 'bg-accent text-accent-ink rounded-br-md' : 'bg-surface shadow-soft rounded-bl-md',
              )}
            >
              {m.text}
              <div className={cx('text-[10px] mt-1 text-right', m.from === 'me' ? 'text-accent-ink/70' : 'text-hint')}>{clockTime(m.ts)}</div>
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-surface shadow-soft rounded-2xl rounded-bl-md px-4 py-3 flex gap-1" aria-label="Печатает">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-2 h-2 rounded-full bg-hint animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="shrink-0 flex items-center gap-2 px-4 pt-2 pb-safe bg-bg border-t border-line" style={{ paddingBottom: 'calc(var(--safe-bottom) + var(--tg-safe-bottom) + 8px)' }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Введите сообщение…"
          aria-label="Сообщение"
          enterKeyHint="send"
          className="flex-1 h-12 rounded-full bg-surface border border-line px-5 outline-none focus:border-accent text-ink placeholder:text-hint"
        />
        <button type="submit" disabled={!text.trim()} aria-label="Отправить" className="w-12 h-12 rounded-full bg-accent text-accent-ink flex items-center justify-center disabled:opacity-40 active:scale-95 transition">
          <Send size={20} />
        </button>
      </form>
    </div>
  )
}

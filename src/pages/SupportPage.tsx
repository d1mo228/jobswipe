import { LifeBuoy, Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { PageHeader, cx } from '../components/ui'
import { getSupportReply, QUICK_QUESTIONS, SUPPORT_GREETING, type SupportMessage } from '../services/support'
import { storage } from '../services/storage'
import { clockTime } from '../utils/format'

const KEY = 'support'

export default function SupportPage() {
  const [list, setList] = useState<SupportMessage[]>(() => {
    const saved = storage.get<SupportMessage[]>(KEY, [])
    return saved.length ? saved : [SUPPORT_GREETING]
  })
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const timer = useRef<number>()

  useEffect(() => {
    storage.set(KEY, list)
  }, [list])
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [list.length, typing])
  useEffect(() => {
    return () => window.clearTimeout(timer.current)
  }, [])

  const send = (raw: string) => {
    const t = raw.trim()
    if (!t || typing) return
    const mine: SupportMessage = { id: `u${Date.now()}`, from: 'me', text: t, ts: Date.now() }
    setList((l) => [...l, mine])
    setText('')
    setTyping(true)
    timer.current = window.setTimeout(() => {
      setList((l) => [...l, { id: `s${Date.now()}`, from: 'support', text: getSupportReply(t), ts: Date.now() }])
      setTyping(false)
    }, 900 + Math.random() * 700)
  }

  return (
    <div className="flex flex-col overflow-hidden flex-1 min-h-0" style={{ height: 'var(--app-height, 100dvh)' }}>
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full btn-primary text-accent-ink flex items-center justify-center"><LifeBuoy size={18} /></span>
            <span>
              <span className="block text-base font-extrabold leading-tight">Поддержка</span>
              <span className="flex items-center gap-1.5 text-xs font-normal text-hint"><span className="w-1.5 h-1.5 rounded-full bg-good" /> на связи</span>
            </span>
          </span>
        }
      />

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-2" aria-live="polite">
        {list.map((m) => (
          <div key={m.id} className={cx('flex', m.from === 'me' ? 'justify-end' : 'justify-start')}>
            <div className={cx('max-w-[82%] rounded-[20px] px-4 py-2.5 text-[15px] break-words', m.from === 'me' ? 'btn-primary text-accent-ink rounded-br-md' : 'bg-surface border border-line/70 shadow-soft rounded-bl-md')}>
              {m.text}
              <div className={cx('text-[10px] mt-1 text-right', m.from === 'me' ? 'text-accent-ink/70' : 'text-hint')}>{clockTime(m.ts)}</div>
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-surface border border-line/70 rounded-[20px] rounded-bl-md px-4 py-3 flex gap-1" aria-label="Печатает">
              {[0, 1, 2].map((i) => <span key={i} className="w-2 h-2 rounded-full bg-hint animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="shrink-0 bg-bg/90 border-t border-line">
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pt-2.5">
          {QUICK_QUESTIONS.map((q) => (
            <button key={q} onClick={() => send(q)} className="h-8 px-3.5 rounded-full border border-line bg-surface text-[13px] font-semibold text-ink/80 whitespace-nowrap active:scale-95 transition">{q}</button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(text) }} className="flex items-center gap-2 px-4 pt-2" style={{ paddingBottom: 'calc(var(--safe-bottom) + var(--tg-safe-bottom) + 10px)' }}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Напишите вопрос…" aria-label="Сообщение в поддержку" enterKeyHint="send" className="flex-1 h-12 rounded-full bg-surface border border-line px-5 outline-none focus:border-accent text-ink placeholder:text-hint" />
          <button type="submit" disabled={!text.trim() || typing} aria-label="Отправить" className="w-12 h-12 rounded-full btn-primary text-accent-ink flex items-center justify-center disabled:opacity-40 active:scale-95 transition"><Send size={19} /></button>
        </form>
      </div>
    </div>
  )
}

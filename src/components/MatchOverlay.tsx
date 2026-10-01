import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { useMainButton } from '../integrations/telegram/useTelegram'
import { telegramHaptic } from '../integrations/telegram/telegram'
import { Button } from './ui'

const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  angle: (i / 22) * Math.PI * 2,
  dist: 120 + (i % 5) * 38,
  size: 6 + (i % 4) * 3,
  color: ['#635bff', '#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b'][i % 5],
  delay: (i % 6) * 0.03,
}))

interface Props {
  open: boolean
  left: ReactNode
  right: ReactNode
  text: string
  onChat: () => void
  onContinue: () => void
}

export function MatchOverlay({ open, left, right, text, onChat, onContinue }: Props) {
  useEffect(() => {
    if (open) telegramHaptic('success')
  }, [open])
  const nativeChat = useMainButton({ text: 'Открыть чат', onClick: onChat, visible: open })

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center px-6 text-center text-white pt-safe pb-safe"
          style={{ background: 'linear-gradient(160deg, #4b43e6 0%, #635bff 45%, #8b5cf6 100%)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="relative w-full flex items-center justify-center h-40">
            {PARTICLES.map((p, i) => (
              <motion.span
                key={i}
                className="absolute rounded-full"
                style={{ width: p.size, height: p.size, background: p.color }}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                animate={{ x: Math.cos(p.angle) * p.dist, y: Math.sin(p.angle) * p.dist, opacity: [0, 1, 0], scale: [0, 1.2, 0.6] }}
                transition={{ duration: 1.3, delay: 0.45 + p.delay, ease: 'easeOut' }}
              />
            ))}
            <motion.div initial={{ x: -140, opacity: 0, rotate: -20 }} animate={{ x: -34, opacity: 1, rotate: -6 }} transition={{ type: 'spring', stiffness: 160, damping: 14 }} className="z-10 rounded-full ring-4 ring-white/80 overflow-hidden">
              {left}
            </motion.div>
            <motion.div initial={{ x: 140, opacity: 0, rotate: 20 }} animate={{ x: 34, opacity: 1, rotate: 6 }} transition={{ type: 'spring', stiffness: 160, damping: 14 }} className="z-10 rounded-full ring-4 ring-white/80 overflow-hidden">
              {right}
            </motion.div>
          </div>

          <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 220, damping: 12 }} className="mt-6 flex items-center gap-2 text-4xl font-extrabold tracking-tight">
            <Sparkles size={30} /> It’s a Match!
          </motion.div>
          <motion.p initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.55 }} className="mt-3 text-lg text-white/90 max-w-xs">
            {text}
          </motion.p>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.75 }} className="mt-10 w-full max-w-xs flex flex-col gap-3">
            {!nativeChat && (
              <Button full onClick={onChat} className="!bg-white !text-[#4b43e6]">
                Открыть чат
              </Button>
            )}
            <Button full variant="ghost" onClick={onContinue} className="!bg-white/15 !text-white !border-white/40 hover:!bg-white/25">
              Продолжить поиск
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

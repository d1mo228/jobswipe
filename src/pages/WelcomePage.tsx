import { motion } from 'framer-motion'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui'
import { useApp } from '../context/AppContext'
import { useMainButton } from '../integrations/telegram/useTelegram'

export default function WelcomePage() {
  const nav = useNavigate()
  const { state } = useApp()
  const go = () => nav('/onboarding')
  const native = useMainButton({ text: 'Начать', onClick: go })
  if (state.onboarded && state.role) return <Navigate to="/home" replace />

  return (
    <div
      className="mx-auto max-w-xl flex flex-col items-center justify-between text-center px-6 pt-safe pb-safe overflow-hidden"
      style={{ minHeight: 'var(--app-height, 100dvh)' }}
    >
      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-10">
        <motion.img
          src="./icons/icon.svg"
          alt=""
          className="w-24 h-24 drop-shadow-xl"
          initial={{ scale: 0.6, opacity: 0, rotate: -12 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 14 }}
        />
        <motion.h1 initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} className="text-4xl font-black tracking-[0.18em] text-accent">
          JOBSWIPE
        </motion.h1>
        <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }} className="space-y-3 max-w-sm">
          <p className="text-2xl font-bold leading-snug">Найди работу, которая подходит именно тебе</p>
          <p className="text-hint">Свайпай вакансии. Получай Match. Начинай карьеру.</p>
        </motion.div>
      </div>
      {!native && (
        <div className="w-full max-w-sm pb-6">
          <Button full onClick={go} className="h-14 text-base">
            Начать
          </Button>
        </div>
      )}
    </div>
  )
}

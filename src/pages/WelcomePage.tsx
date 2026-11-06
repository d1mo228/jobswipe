import { motion } from 'framer-motion'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button, CompanyLogo, ScoreRing, Wordmark } from '../components/ui'
import { useApp } from '../context/AppContext'
import { useMainButton } from '../integrations/telegram/useTelegram'

const SAMPLE = [
  { name: 'NovaTech', color: '#635bff', title: 'Junior Marketing Specialist', pay: '80–120', score: 91, rot: -7, x: -36, y: 24, z: 1 },
  { name: 'DataWave', color: '#0ea5e9', title: 'Junior Data Analyst', pay: '90–130', score: 85, rot: 6, x: 30, y: 6, z: 2 },
  { name: 'BrightLab', color: '#f59e0b', title: 'Product Intern', pay: '45–65', score: 78, rot: -2, x: 0, y: -14, z: 3 },
]

export default function WelcomePage() {
  const nav = useNavigate()
  const { state } = useApp()
  const go = () => nav('/onboarding')
  const native = useMainButton({ text: 'Начать', onClick: go })
  if (state.onboarded && state.role) return <Navigate to="/home" replace />

  return (
    <div className="mx-auto max-w-xl flex flex-col px-6 pt-safe pb-safe overflow-hidden" style={{ minHeight: 'var(--app-height, 100dvh)' }}>
      <div className="pt-6"><Wordmark size={20} /></div>

      {/* Веер карточек */}
      <div className="relative flex-1 min-h-[250px] max-h-[340px] mt-4" aria-hidden>
        {SAMPLE.map((c, i) => (
          <motion.div
            key={c.name}
            className="absolute left-1/2 top-1/2 w-[236px] -ml-[118px] -mt-[70px] bg-surface rounded-3xl border border-line/70 shadow-card p-4"
            style={{ zIndex: c.z }}
            initial={{ opacity: 0, y: 60, rotate: 0 }}
            animate={{ opacity: 1, x: c.x, y: c.y, rotate: c.rot }}
            transition={{ delay: 0.1 + i * 0.12, type: 'spring', stiffness: 120, damping: 16 }}
          >
            <div className="floaty" style={{ ['--r' as string]: '0deg', animationDelay: `${i * 0.8}s` }}>
              <div className="flex items-center gap-2.5">
                <CompanyLogo name={c.name} color={c.color} size={36} />
                <div className="text-sm font-bold flex-1">{c.name}</div>
                <ScoreRing score={c.score} size={38} />
              </div>
              <div className="font-display font-extrabold text-[17px] leading-tight mt-3">{c.title}</div>
              <div className="text-xs text-hint mt-1">{c.pay} тыс. ₽ · Москва</div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="pb-6">
        <div className="eyebrow mb-3">Работа для студентов</div>
        <h1 className="text-[34px] leading-[1.05] font-extrabold">Найди работу, которая подходит именно тебе</h1>
        <p className="text-hint mt-3">Свайпай вакансии. Получай Match. Начинай карьеру.</p>
        {!native && (
          <Button full onClick={go} className="h-14 text-base mt-6">
            Начать
          </Button>
        )}
      </motion.div>
    </div>
  )
}

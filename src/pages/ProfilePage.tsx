import { Pencil, Plus, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { CompanyView, StudentProfileView } from '../components/ProfileView'
import { Button, PageHeader } from '../components/ui'
import { useApp } from '../context/AppContext'
import { useTelegram } from '../integrations/telegram/useTelegram'

export default function ProfilePage() {
  const nav = useNavigate()
  const { role, student, employer } = useApp()
  const { isTelegram } = useTelegram()

  const settingsBtn = (
    <button onClick={() => nav('/settings')} aria-label="Настройки" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface2">
      <Settings size={22} />
    </button>
  )

  if (role === 'employer' && employer) {
    return (
      <>
        <PageHeader back={false} title="Профиль компании" right={settingsBtn} />
        <div className="px-4 pb-8 space-y-3">
          <CompanyView company={employer.company} jobs={employer.jobs} />
          <div className="flex flex-col gap-2">
            <Button full onClick={() => nav('/new-job')}><Plus size={18} /> Новая вакансия</Button>
            <Button full variant="ghost" onClick={() => nav('/edit-profile')}><Pencil size={18} /> Редактировать профиль</Button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader back={false} title="Профиль" right={settingsBtn} />
      <div className="px-4 pb-8 space-y-3">
        <StudentProfileView p={student!.profile} showUsername={isTelegram} />
        <Button full onClick={() => nav('/edit-profile')}><Pencil size={18} /> Редактировать профиль</Button>
      </div>
    </>
  )
}

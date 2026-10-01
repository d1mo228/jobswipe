import { Navigate, useParams } from 'react-router-dom'
import { CompanyView } from '../components/ProfileView'
import { PageHeader } from '../components/ui'
import { useApp } from '../context/AppContext'
import { mockApi } from '../services/mockApi'

export default function CompanyPage() {
  const { id = '' } = useParams()
  const { employer, role } = useApp()
  // Работодатель видит собственные (в т.ч. новые) вакансии
  const own = role === 'employer' && employer?.company.id === id ? employer : null
  const company = own?.company ?? mockApi.getCompany(id)
  if (!company) return <Navigate to="/home" replace />
  const jobs = own ? own.jobs : mockApi.getJobsByCompany(id)
  return (
    <>
      <PageHeader title="Компания" />
      <div className="px-4 pb-8">
        <CompanyView company={company} jobs={jobs} />
      </div>
    </>
  )
}

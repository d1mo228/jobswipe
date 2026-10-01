import type { Filters, Match, Message, StudentProfile, Company } from '../types'
import { COMPANIES } from './companies'
import { JOBS } from './jobs'

const HOUR = 3600_000
const now = () => Date.now()

export const DEFAULT_FILTERS: Filters = {
  city: '',
  remoteOnly: false,
  salaryMin: 0,
  direction: '',
  experience: 'any',
  employment: '',
  skills: [],
}

/** Demo Student — полностью заполненный профиль студента */
export const DEMO_STUDENT: StudentProfile = {
  id: 'student-demo',
  name: 'Demo Student',
  username: 'demo_user',
  university: 'НИУ ВШЭ',
  major: 'Бизнес-информатика',
  gradYear: 2026,
  city: 'Москва',
  skills: ['Python', 'SQL', 'Analytics', 'Excel', 'English'],
  desiredTitle: 'Junior Marketing Analyst',
  direction: 'Маркетинг',
  salary: 90,
  workFormat: 'hybrid',
  experience: 'Стажировка маркетолога-аналитика (6 мес.), студенческий проект по CRM-аналитике',
  experienceMonths: 6,
  portfolio: 'https://portfolio.example/demo-student',
  about: 'Выпускник бизнес-информатики. Люблю данные, продукты и быстрые эксперименты.',
}

/** Demo Employer — компания NovaTech */
export const DEMO_EMPLOYER_COMPANY: Company = COMPANIES[0]

export function buildDemoStudentState() {
  const likes = ['j-nova-1', 'j-data-1', 'j-bright-1', 'j-fin-1']
  const passes = ['j-logi-2']
  const t = now()
  const matches: Match[] = [
    { id: 'm-s-1', jobId: 'j-nova-1', companyId: 'c-nova', candidateId: DEMO_STUDENT.id, createdAt: t - 26 * HOUR, unread: false },
    { id: 'm-s-2', jobId: 'j-data-1', companyId: 'c-data', candidateId: DEMO_STUDENT.id, createdAt: t - 5 * HOUR, unread: true },
    { id: 'm-s-3', jobId: 'j-bright-1', companyId: 'c-bright', candidateId: DEMO_STUDENT.id, createdAt: t - 1 * HOUR, unread: true },
  ]
  const messages: Record<string, Message[]> = {
    'm-s-1': [
      { id: 'ms1', matchId: 'm-s-1', from: 'them', text: 'Здравствуйте! Нам понравился ваш профиль. Хотели бы обсудить вакансию?', ts: t - 25 * HOUR },
      { id: 'ms2', matchId: 'm-s-1', from: 'me', text: 'Здравствуйте! Да, конечно.', ts: t - 24 * HOUR },
      { id: 'ms3', matchId: 'm-s-1', from: 'them', text: 'Отлично! Когда вам удобно созвониться — завтра после 15:00?', ts: t - 23 * HOUR },
    ],
    'm-s-2': [
      { id: 'ms4', matchId: 'm-s-2', from: 'them', text: 'Привет! Расскажите, с какими инструментами аналитики вы уже работали?', ts: t - 4 * HOUR },
    ],
    'm-s-3': [],
  }
  return { profile: DEMO_STUDENT, likes, passes, matches, messages }
}

export function buildDemoEmployerState() {
  const t = now()
  const myJobs = JOBS.filter((j) => j.companyId === DEMO_EMPLOYER_COMPANY.id).map((j) => j.id)
  const likes = ['j-nova-1:cand-1', 'j-nova-3:cand-2'] // `${jobId}:${candidateId}`
  const passes = ['j-nova-1:cand-10']
  const matches: Match[] = [
    { id: 'm-e-1', jobId: 'j-nova-1', companyId: DEMO_EMPLOYER_COMPANY.id, candidateId: 'cand-1', createdAt: t - 20 * HOUR, unread: false },
    { id: 'm-e-2', jobId: 'j-nova-3', companyId: DEMO_EMPLOYER_COMPANY.id, candidateId: 'cand-2', createdAt: t - 3 * HOUR, unread: true },
  ]
  const messages: Record<string, Message[]> = {
    'm-e-1': [
      { id: 'me1', matchId: 'm-e-1', from: 'me', text: 'Здравствуйте, Мария! Нам понравился ваш профиль. Хотели бы обсудить вакансию?', ts: t - 19 * HOUR },
      { id: 'me2', matchId: 'm-e-1', from: 'them', text: 'Здравствуйте! Да, конечно. Очень интересно.', ts: t - 18 * HOUR },
    ],
    'm-e-2': [
      { id: 'me3', matchId: 'm-e-2', from: 'them', text: 'Добрый день! Спасибо за Like — расскажете подробнее о стажировке?', ts: t - 2 * HOUR },
    ],
  }
  return { company: DEMO_EMPLOYER_COMPANY, jobIds: myJobs, likes, passes, matches, messages }
}

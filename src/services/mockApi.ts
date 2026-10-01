/**
 * Mock API. Все данные пока локальные; когда появится backend, заменяйте реализацию
 * функций здесь (на fetch к VITE_API_URL), а UI менять не придётся.
 */
import { CANDIDATES, getCandidate } from '../data/candidates'
import { COMPANIES, getCompany } from '../data/companies'
import { JOBS, getJob } from '../data/jobs'
import type { Candidate, Company, Job } from '../types'

export const mockApi = {
  getAllJobs: (): Job[] => JOBS,
  getJob: (id: string): Job | undefined => getJob(id),
  getAllCompanies: (): Company[] => COMPANIES,
  getCompany: (id: string): Company | undefined => getCompany(id),
  getAllCandidates: (): Candidate[] => CANDIDATES,
  getCandidate: (id: string): Candidate | undefined => getCandidate(id),
  getJobsByCompany: (companyId: string): Job[] => JOBS.filter((j) => j.companyId === companyId),

  /**
   * Mock: правила Match.
   * Студент лайкнул вакансию → Match, если работодатель уже лайкнул студента.
   */
  employerLikesStudent: (job: Job): boolean => !!job.employerLikedYou,
  /** Работодатель лайкнул кандидата → Match, если кандидат уже интересовался вакансией. */
  studentLikesJob: (candidate: Candidate, jobId: string): boolean => candidate.interestedIn.includes(jobId),

  /** Mock-ответ собеседника в чате */
  getAutoReply(index: number, asEmployer: boolean): string {
    const fromCompany = [
      'Спасибо! Давайте назначим короткий созвон на 20 минут.',
      'Отлично. Пришлёте, пожалуйста, ссылку на портфолио или резюме?',
      'Принято! Мы вернёмся с обратной связью в течение пары дней.',
    ]
    const fromStudent = [
      'Здравствуйте! Спасибо, что написали — буду рада обсудить.',
      'Да, готов(а) к созвону. Удобно завтра во второй половине дня.',
      'Хорошо, отправлю резюме в ближайшее время.',
    ]
    const list = asEmployer ? fromStudent : fromCompany
    return list[index % list.length]
  },
}

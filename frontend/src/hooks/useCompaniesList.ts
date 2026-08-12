import { useCallback, useEffect, useState } from 'react'
import { fetchCompanies } from '../api/companies'
import type { CompanyOut } from '../types/api'

interface CompaniesListState {
  companies: CompanyOut[]
  loading: boolean
  /** Запрос не удался. Текст ошибки страница берёт из словаря сама. */
  failed: boolean
  reload: () => void
}

/** Итог одной попытки запроса. */
interface Attempt {
  number: number
  companies: CompanyOut[]
  failed: boolean
}

/**
 * Список компаний для страницы Companies.
 *
 * Отдельно от `useDirectories`, который грузит компании ради названий:
 * там ошибка глотается молча, а здесь она — состояние страницы, и её нужно
 * показать вместе с кнопкой «Retry». Паттерн тот же, что в `useUsersList`.
 */
export function useCompaniesList(): CompaniesListState {
  const [attemptNumber, setAttemptNumber] = useState(0)
  const [attempt, setAttempt] = useState<Attempt | null>(null)

  const reload = useCallback(() => setAttemptNumber((value) => value + 1), [])

  useEffect(() => {
    // Флаг «эффект ещё актуален»: если страницу закрыли, пока шёл запрос,
    // состояние трогать нельзя.
    let isActive = true

    void (async () => {
      try {
        const loaded = await fetchCompanies()
        if (isActive) {
          setAttempt({
            number: attemptNumber,
            companies: loaded,
            failed: false,
          })
        }
      } catch {
        if (isActive) {
          setAttempt({ number: attemptNumber, companies: [], failed: true })
        }
      }
    })()

    return () => {
      isActive = false
    }
  }, [attemptNumber])

  const isCurrent = attempt !== null && attempt.number === attemptNumber

  return {
    companies: isCurrent ? attempt.companies : [],
    loading: !isCurrent,
    failed: isCurrent && attempt.failed,
    reload,
  }
}

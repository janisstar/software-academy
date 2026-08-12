import { useCallback, useEffect, useState } from 'react'
import { fetchUser } from '../api/users'
import { useDirectories } from './useDirectories'
import type { CompanyOut, RoleOut, UserOut } from '../types/api'

interface UseUserParams {
  /** Логин из адреса страницы. */
  un: string
  /** Грузить ли справочник компаний — он доступен только роли master. */
  withCompanies: boolean
}

interface UserState {
  user: UserOut | null
  roles: RoleOut[]
  companies: CompanyOut[]
  loading: boolean
  /** Запрос не удался — в том числе если такого пользователя нет (404). */
  failed: boolean
  /** Перечитать пользователя после изменения. */
  reload: () => void
}

/** Итог одной попытки запроса. */
interface Attempt {
  number: number
  /** Чей логин запрашивали: адрес мог смениться, пока шёл запрос. */
  un: string
  user: UserOut | null
  failed: boolean
}

/**
 * Загрузка одного пользователя для его страницы.
 *
 * Паттерн тот же, что в `useUsersList`: номер попытки плюс результат последней
 * ЗАВЕРШЁННОЙ попытки, из которого выводятся `loading` и `failed`.
 */
export function useUser({ un, withCompanies }: UseUserParams): UserState {
  const [attemptNumber, setAttemptNumber] = useState(0)
  const [attempt, setAttempt] = useState<Attempt | null>(null)

  const { roles, companies } = useDirectories(withCompanies)

  const reload = useCallback(() => setAttemptNumber((value) => value + 1), [])

  useEffect(() => {
    // Флаг «эффект ещё актуален»: если страницу закрыли или сменили логин,
    // пока шёл запрос, состояние трогать нельзя.
    let isActive = true

    void (async () => {
      try {
        const loaded = await fetchUser(un)
        if (isActive) {
          setAttempt({ number: attemptNumber, un, user: loaded, failed: false })
        }
      } catch {
        if (isActive) {
          setAttempt({ number: attemptNumber, un, user: null, failed: true })
        }
      }
    })()

    return () => {
      isActive = false
    }
  }, [un, attemptNumber])

  // «Грузим» = результат ТЕКУЩЕЙ попытки по ТЕКУЩЕМУ логину ещё не пришёл.
  const isCurrent =
    attempt !== null && attempt.number === attemptNumber && attempt.un === un

  return {
    user: isCurrent ? attempt.user : null,
    roles,
    companies,
    loading: !isCurrent,
    failed: isCurrent && attempt.failed,
    reload,
  }
}

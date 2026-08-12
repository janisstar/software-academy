import { useCallback, useEffect, useState } from 'react'
import { fetchUsers } from '../api/users'
import { useDirectories } from './useDirectories'
import type { CompanyOut, RoleOut, UserOut } from '../types/api'

/**
 * Сколько пользователей грузим за раз. Постраничности в интерфейсе пока нет:
 * список показываем целиком, в подвале таблицы — только общее число.
 */
const USERS_LIMIT = 200

interface UseUsersListParams {
  /** Фильтр по компании; `null` = все компании. */
  companyId: number | null
  /** Грузить ли справочник компаний — он доступен только роли master. */
  withCompanies: boolean
}

interface UsersListState {
  users: UserOut[]
  /** Справочник ролей: нужен, чтобы показать название роли, а не её ключ. */
  roles: RoleOut[]
  /** Справочник компаний: для селекта фильтра и названий в колонке Company. */
  companies: CompanyOut[]
  loading: boolean
  /** Запрос списка не удался. Текст ошибки страница берёт из словаря сама. */
  failed: boolean
  /** Перезапросить список: и кнопкой Retry, и после смены доступа. */
  reload: () => void
}

/** Итог одной попытки запроса списка. */
interface Attempt {
  number: number
  /** С каким фильтром компании эта попытка запрашивалась. */
  companyId: number | null
  users: UserOut[]
  failed: boolean
}

/**
 * Загрузка списка пользователей и двух справочников к нему.
 *
 * Паттерн тот же, что в `useMasterDashboard`: номер попытки + результат
 * последней ЗАВЕРШЁННОЙ попытки, из которого выводятся `loading` и `failed`.
 * Отличие одно — попытка помнит ещё и фильтр компании, иначе после смены
 * фильтра список считался бы уже загруженным.
 */
export function useUsersList({
  companyId,
  withCompanies,
}: UseUsersListParams): UsersListState {
  const [attemptNumber, setAttemptNumber] = useState(0)
  const [attempt, setAttempt] = useState<Attempt | null>(null)

  // Справочники живут отдельно: от фильтра и от повторов они не зависят.
  const { roles, companies } = useDirectories(withCompanies)

  const reload = useCallback(() => setAttemptNumber((value) => value + 1), [])

  useEffect(() => {
    // Флаг «эффект ещё актуален»: если страницу закрыли или сменили фильтр,
    // пока шёл запрос, состояние трогать нельзя (тот же приём в AuthProvider).
    let isActive = true

    void (async () => {
      try {
        const loaded = await fetchUsers({ companyId, limit: USERS_LIMIT })
        if (isActive) {
          setAttempt({
            number: attemptNumber,
            companyId,
            users: loaded,
            failed: false,
          })
        }
      } catch {
        if (isActive) {
          setAttempt({
            number: attemptNumber,
            companyId,
            users: [],
            failed: true,
          })
        }
      }
    })()

    return () => {
      isActive = false
    }
  }, [companyId, attemptNumber])

  // «Грузим» = результат ТЕКУЩЕЙ попытки с ТЕКУЩИМ фильтром ещё не пришёл.
  const isCurrent =
    attempt !== null &&
    attempt.number === attemptNumber &&
    attempt.companyId === companyId

  return {
    users: isCurrent ? attempt.users : [],
    roles,
    companies,
    loading: !isCurrent,
    failed: isCurrent && attempt.failed,
    reload,
  }
}

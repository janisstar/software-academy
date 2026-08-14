import { useCallback, useEffect, useState } from 'react'
import { fetchMasterLessons } from '../api/lessons'
import type { MasterLesson } from '../types/api'

interface MasterLessonsState {
  lessons: MasterLesson[]
  loading: boolean
  /** Запрос не удался. Текст ошибки страница берёт из словаря сама. */
  failed: boolean
  /** Перечитать список: и кнопкой Retry, и после сдвига порядка. */
  reload: () => void
}

/** Итог одной попытки запроса. Номер попытки внутри — см. `loading` ниже. */
interface Attempt {
  number: number
  lessons: MasterLesson[]
  failed: boolean
}

/**
 * Загрузка таблицы уроков для master.
 *
 * Паттерн «номер попытки» тот же, что в `useCategoriesTree` и `useUsersList`:
 * `reload()` увеличивает номер и этим перезапускает эффект, а `loading`
 * и `failed` выводятся из результата последней ЗАВЕРШЁННОЙ попытки.
 *
 * После сдвига порядка список перечитывается целиком: `order` считает бэкенд,
 * и переставлять строки на клиенте значило бы гадать за него.
 *
 * `enabled` нужен потому, что страница доступна только роли master: остальным
 * запрос не отправляем вовсе.
 */
export function useMasterLessons(enabled: boolean): MasterLessonsState {
  const [attemptNumber, setAttemptNumber] = useState(0)
  const [attempt, setAttempt] = useState<Attempt | null>(null)

  const reload = useCallback(() => setAttemptNumber((value) => value + 1), [])

  useEffect(() => {
    if (!enabled) {
      return
    }

    // Флаг «эффект ещё актуален»: если страницу закрыли, пока шёл запрос,
    // состояние трогать нельзя (тот же приём, что в AuthProvider).
    let isActive = true

    void (async () => {
      try {
        const lessons = await fetchMasterLessons()
        if (isActive) {
          setAttempt({ number: attemptNumber, lessons, failed: false })
        }
      } catch {
        if (isActive) {
          setAttempt({ number: attemptNumber, lessons: [], failed: true })
        }
      }
    })()

    return () => {
      isActive = false
    }
  }, [enabled, attemptNumber])

  // «Грузим» = результат текущей попытки ещё не пришёл.
  const loading = enabled && attempt?.number !== attemptNumber

  return {
    lessons: attempt?.lessons ?? [],
    loading,
    failed: !loading && (attempt?.failed ?? false),
    reload,
  }
}

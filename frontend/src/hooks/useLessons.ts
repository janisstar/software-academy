import { useCallback, useEffect, useState } from 'react'
import { listLessons } from '../api/lessons'
import type { LessonWithStatus } from '../types/api'

interface LessonsState {
  lessons: LessonWithStatus[]
  loading: boolean
  /**
   * Ошибка последней попытки; `null` — ошибки не было. Возвращаем саму ошибку,
   * а не готовый текст: превратить её в строку должна страница через
   * `apiErrorText` — там же лежит и запасной текст из словаря (как в
   * `useDashboard`).
   */
  error: unknown
  /** Перечитать список — кнопкой Retry после ошибки. */
  reload: () => void
}

/** Итог одной попытки запроса. */
interface Attempt {
  number: number
  /** С каким фильтром категории эта попытка запрашивалась. */
  categoryId: number | undefined
  lessons: LessonWithStatus[]
  error: unknown
}

/**
 * Загрузка учебного каталога — уроков со статусом личного прогресса.
 *
 * Паттерн «номер попытки» тот же, что в `useUsersList`: храним результат
 * последней ЗАВЕРШЁННОЙ попытки, а `loading` и `error` выводим из него.
 * Попытка помнит ещё и фильтр категории — иначе после смены `categoryId`
 * старый список считался бы уже загруженным.
 *
 * Чего здесь намеренно НЕТ:
 * - проверки роли: кого пускать в каталог, решает страница через `activeRole`
 *   ДО запроса — ловить 403 постфактум мы не хотим. Поэтому и параметра
 *   `enabled`, как у master-хуков, тут нет;
 * - группировки по категориям: раскладка — дело страницы каталога, хук отдаёт
 *   уроки ровно в том порядке, в котором их прислал бэкенд.
 */
export function useLessons(categoryId?: number): LessonsState {
  const [attemptNumber, setAttemptNumber] = useState(0)
  const [attempt, setAttempt] = useState<Attempt | null>(null)

  const reload = useCallback(() => setAttemptNumber((value) => value + 1), [])

  useEffect(() => {
    // Флаг «эффект ещё актуален»: если страницу закрыли или сменили категорию,
    // пока шёл запрос, состояние трогать нельзя (тот же приём в AuthProvider).
    let isActive = true

    void (async () => {
      try {
        const loaded = await listLessons(categoryId)
        if (isActive) {
          setAttempt({
            number: attemptNumber,
            categoryId,
            lessons: loaded,
            error: null,
          })
        }
      } catch (caught) {
        if (isActive) {
          setAttempt({
            number: attemptNumber,
            categoryId,
            lessons: [],
            error: caught,
          })
        }
      }
    })()

    return () => {
      isActive = false
    }
  }, [categoryId, attemptNumber])

  // «Грузим» = результат ТЕКУЩЕЙ попытки с ТЕКУЩИМ фильтром ещё не пришёл.
  const isCurrent =
    attempt !== null &&
    attempt.number === attemptNumber &&
    attempt.categoryId === categoryId

  return {
    lessons: isCurrent ? attempt.lessons : [],
    loading: !isCurrent,
    error: isCurrent ? attempt.error : null,
    reload,
  }
}

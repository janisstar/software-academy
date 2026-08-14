import { useCallback, useEffect, useState } from 'react'
import { fetchLesson } from '../api/lessons'
import type { LessonOut } from '../types/api'

interface LessonState {
  lesson: LessonOut | null
  loading: boolean
  /** Запрос не удался — в том числе если такого урока нет (404). */
  failed: boolean
  /** Перечитать урок после ошибки. */
  reload: () => void
}

/** Итог одной попытки запроса. */
interface Attempt {
  number: number
  /** Какой урок запрашивали: адрес мог смениться, пока шёл запрос. */
  id: number
  lesson: LessonOut | null
  failed: boolean
}

/**
 * Загрузка одного урока для формы редактирования.
 *
 * Паттерн тот же, что в `useUser`: номер попытки плюс результат последней
 * ЗАВЕРШЁННОЙ попытки, из которого выводятся `loading` и `failed`.
 *
 * `id === null` — форма создания: грузить нечего, запроса нет.
 */
export function useLesson(id: number | null): LessonState {
  const [attemptNumber, setAttemptNumber] = useState(0)
  const [attempt, setAttempt] = useState<Attempt | null>(null)

  const reload = useCallback(() => setAttemptNumber((value) => value + 1), [])

  useEffect(() => {
    if (id === null) {
      return
    }

    // Флаг «эффект ещё актуален»: если страницу закрыли или сменился адрес,
    // пока шёл запрос, состояние трогать нельзя.
    let isActive = true

    void (async () => {
      try {
        const loaded = await fetchLesson(id)
        if (isActive) {
          setAttempt({
            number: attemptNumber,
            id,
            lesson: loaded,
            failed: false,
          })
        }
      } catch {
        if (isActive) {
          setAttempt({ number: attemptNumber, id, lesson: null, failed: true })
        }
      }
    })()

    return () => {
      isActive = false
    }
  }, [id, attemptNumber])

  // «Грузим» = результат ТЕКУЩЕЙ попытки по ТЕКУЩЕМУ уроку ещё не пришёл.
  const isCurrent =
    attempt !== null && attempt.number === attemptNumber && attempt.id === id

  return {
    lesson: isCurrent ? attempt.lesson : null,
    loading: id !== null && !isCurrent,
    failed: isCurrent && attempt.failed,
    reload,
  }
}

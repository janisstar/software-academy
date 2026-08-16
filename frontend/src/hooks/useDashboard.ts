import { useCallback, useEffect, useState } from 'react'
import { fetchDashboard } from '../api/dashboard'
import type { Dashboard } from '../types/api'

interface DashboardState {
  data: Dashboard | null
  loading: boolean
  /**
   * Ошибка последней попытки; `null` — ошибки не было. Возвращаем саму ошибку,
   * а не готовый текст: перевести её в строку должна страница через
   * `apiErrorText` — там же лежит и запасной текст из словаря.
   */
  error: unknown
  /** Повторить запрос после ошибки. */
  retry: () => void
}

/** Итог одной попытки запроса. Номер попытки внутри — см. `loading` ниже. */
interface Attempt {
  number: number
  data: Dashboard | null
  error: unknown
}

/**
 * Разовая загрузка личного дашборда.
 *
 * Паттерн «номер попытки» — тот же, что в `useMasterDashboard`: храним
 * результат последней ЗАВЕРШЁННОЙ попытки, а `loading` выводим из него.
 * Автообновления нет: данные грузятся один раз при заходе на страницу.
 *
 * Своего условия «грузить или нет» здесь не нужно: страница живёт только
 * внутри учебной области, куда `AreaGate area="app"` не пускает master —
 * значит и запрос из его интерфейса не уйдёт.
 */
export function useDashboard(): DashboardState {
  // Номер текущей попытки. Его увеличивает Retry — и этим перезапускает эффект.
  const [attemptNumber, setAttemptNumber] = useState(0)
  // Результат последней завершённой попытки; null — ни одна ещё не дошла.
  const [attempt, setAttempt] = useState<Attempt | null>(null)

  const retry = useCallback(() => setAttemptNumber((value) => value + 1), [])

  useEffect(() => {
    // Флаг «эффект ещё актуален»: если страницу закрыли, пока шёл запрос,
    // состояние трогать нельзя (тот же приём, что в AuthProvider).
    let isActive = true

    void (async () => {
      try {
        const data = await fetchDashboard()
        if (isActive) {
          setAttempt({ number: attemptNumber, data, error: null })
        }
      } catch (caught) {
        if (isActive) {
          setAttempt({ number: attemptNumber, data: null, error: caught })
        }
      }
    })()

    return () => {
      isActive = false
    }
  }, [attemptNumber])

  // «Грузим» = результат текущей попытки ещё не пришёл. Отдельного состояния
  // для этого нет намеренно: все значения выводятся из одного результата
  // и не разъезжаются.
  const loading = attempt?.number !== attemptNumber

  return {
    data: attempt?.data ?? null,
    loading,
    error: loading ? null : (attempt?.error ?? null),
    retry,
  }
}

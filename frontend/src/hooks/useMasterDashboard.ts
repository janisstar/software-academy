import { useCallback, useEffect, useState } from 'react'
import { fetchMasterDashboard } from '../api/masterDashboard'
import type { MasterDashboard } from '../types/api'

interface MasterDashboardState {
  data: MasterDashboard | null
  loading: boolean
  /** Запрос не удался. Текст ошибки страница берёт из словаря сама. */
  failed: boolean
  /** Повторить запрос после ошибки. */
  retry: () => void
}

/** Итог одной попытки запроса. Номер попытки внутри — см. `loading` ниже. */
interface Attempt {
  number: number
  data: MasterDashboard | null
  failed: boolean
}

/**
 * Разовая загрузка сводки платформы.
 *
 * `enabled` нужен потому, что эндпоинт доступен только роли master: остальным
 * запрос вообще не отправляем, чтобы не ловить 403 постфактум.
 * Автообновления нет — данные грузятся один раз при заходе на страницу.
 */
export function useMasterDashboard(enabled: boolean): MasterDashboardState {
  // Номер текущей попытки. Его увеличивает Retry — и этим перезапускает эффект.
  const [attemptNumber, setAttemptNumber] = useState(0)
  // Результат последней ЗАВЕРШЁННОЙ попытки; null — ни одна ещё не дошла.
  const [attempt, setAttempt] = useState<Attempt | null>(null)

  const retry = useCallback(() => setAttemptNumber((value) => value + 1), [])

  useEffect(() => {
    if (!enabled) {
      return
    }

    // Флаг «эффект ещё актуален»: если страницу закрыли, пока шёл запрос,
    // состояние трогать нельзя (тот же приём, что в AuthProvider).
    let isActive = true

    void (async () => {
      try {
        const data = await fetchMasterDashboard()
        if (isActive) {
          setAttempt({ number: attemptNumber, data, failed: false })
        }
      } catch {
        if (isActive) {
          setAttempt({ number: attemptNumber, data: null, failed: true })
        }
      }
    })()

    return () => {
      isActive = false
    }
  }, [enabled, attemptNumber])

  // «Грузим» = результат текущей попытки ещё не пришёл. Отдельного состояния
  // для этого нет намеренно: ставить его пришлось бы синхронно в эффекте,
  // а так все три значения выводятся из одного результата и не разъезжаются.
  const loading = enabled && attempt?.number !== attemptNumber

  return {
    data: attempt?.data ?? null,
    loading,
    failed: !loading && (attempt?.failed ?? false),
    retry,
  }
}

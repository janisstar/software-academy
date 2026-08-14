import { useCallback, useEffect, useState } from 'react'
import { fetchCategoryTree } from '../api/categories'
import type { CategoryTree } from '../types/api'

interface CategoriesTreeState {
  tree: CategoryTree[]
  loading: boolean
  /** Запрос не удался. Текст ошибки страница берёт из словаря сама. */
  failed: boolean
  /** Перечитать дерево: и кнопкой Retry, и после каждого изменения. */
  reload: () => void
}

/** Итог одной попытки запроса. Номер попытки внутри — см. `loading` ниже. */
interface Attempt {
  number: number
  tree: CategoryTree[]
  failed: boolean
}

/**
 * Загрузка дерева категорий.
 *
 * Паттерн «номер попытки» тот же, что в `useMasterDashboard` и `useUsersList`:
 * `reload()` увеличивает номер и этим перезапускает эффект, а `loading`
 * и `failed` выводятся из результата последней ЗАВЕРШЁННОЙ попытки.
 *
 * Здесь `reload()` вызывается после КАЖДОГО изменения (создание, переименование,
 * перенос, сдвиг, удаление): порядок и счётчики считает бэкенд, поэтому дерево
 * мы не правим на клиенте, а перечитываем целиком.
 *
 * `enabled` нужен потому, что страница доступна только роли master: остальным
 * запрос не отправляем вовсе.
 */
export function useCategoriesTree(enabled: boolean): CategoriesTreeState {
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
        const tree = await fetchCategoryTree()
        if (isActive) {
          setAttempt({ number: attemptNumber, tree, failed: false })
        }
      } catch {
        if (isActive) {
          setAttempt({ number: attemptNumber, tree: [], failed: true })
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
    tree: attempt?.tree ?? [],
    loading,
    failed: !loading && (attempt?.failed ?? false),
    reload,
  }
}

import { apiRequest } from './client'
import { API_ENDPOINTS } from '../constants/api'
import type {
  LessonMovePayload,
  MasterLesson,
  MoveDirection,
} from '../types/api'

/**
 * Все уроки платформы для таблицы управления (только master).
 *
 * Порядок — тот, в котором их отдал бэкенд: внутри категории он уже
 * отсортирован по `order`. Клиент НИЧЕГО не пересортировывает, иначе
 * управление порядком показывало бы не то, что видят учащиеся.
 */
export async function fetchMasterLessons(): Promise<MasterLesson[]> {
  return apiRequest<MasterLesson[]>(API_ENDPOINTS.masterLessons, {
    method: 'GET',
  })
}

/**
 * Сдвинуть урок на одну позицию вверх/вниз внутри своей категории.
 *
 * Ответ не нужен: если урок уже крайний, бэкенд отвечает `status: "noop"` —
 * это не ошибка, и делать в интерфейсе тоже нечего.
 */
export async function moveLesson(
  id: number,
  direction: MoveDirection,
): Promise<void> {
  const payload: LessonMovePayload = { id, direction }

  await apiRequest<unknown>(API_ENDPOINTS.lessonMove, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

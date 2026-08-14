import { apiRequest } from './client'
import { API_ENDPOINTS } from '../constants/api'
import type {
  LessonCreatePayload,
  LessonMovePayload,
  LessonOut,
  LessonUpdatePayload,
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
 * Один урок целиком — то, что открывает форма редактирования.
 *
 * Здесь есть описание, транскрипт и видимость, которых нет в строке таблицы:
 * длинные тексты грузятся только когда урок действительно открыли.
 */
export async function fetchLesson(id: number): Promise<LessonOut> {
  return apiRequest<LessonOut>(`${API_ENDPOINTS.lesson}${id}`, {
    method: 'GET',
  })
}

/** Создать урок. Он встаёт в конец своей категории — порядок считает бэкенд. */
export async function createLesson(
  payload: LessonCreatePayload,
): Promise<LessonOut> {
  return apiRequest<LessonOut>(API_ENDPOINTS.lesson, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Обновить урок.
 *
 * Форма присылает ПОЛНОЕ тело, а не только изменившиеся поля: у бэкенда
 * «поля нет» значит «не менять», поэтому очистить описание или транскрипт
 * иначе было бы нечем. Очищенное поле уезжает пустой строкой.
 */
export async function updateLesson(
  payload: LessonUpdatePayload,
): Promise<LessonOut> {
  return apiRequest<LessonOut>(API_ENDPOINTS.lesson, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

/**
 * Удалить урок вместе с прогрессом учащихся по нему.
 *
 * id — в строке запроса, как у остальных DELETE в этом API.
 */
export async function deleteLesson(id: number): Promise<void> {
  await apiRequest<unknown>(`${API_ENDPOINTS.lesson}?id=${id}`, {
    method: 'DELETE',
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

import { apiRequest } from './client'
import { API_ENDPOINTS } from '../constants/api'
import type {
  CategoryCreatePayload,
  CategoryMovePayload,
  CategoryOut,
  CategoryTree,
  CategoryUpdatePayload,
  MoveDirection,
} from '../types/api'

/**
 * Дерево категорий каталога (два уровня).
 *
 * Порядок строк — тот, в котором их отдал бэкенд: он уже отсортировал их по
 * полю `order`. Клиент НИЧЕГО не пересортировывает, иначе интерфейс управления
 * порядком показывал бы не то, что видят учащиеся.
 */
export async function fetchCategoryTree(): Promise<CategoryTree[]> {
  return apiRequest<CategoryTree[]>(API_ENDPOINTS.categories, {
    method: 'GET',
  })
}

/** Создать категорию. `parentId = null` → категория верхнего уровня. */
export async function createCategory(
  name: string,
  parentId: number | null,
): Promise<CategoryOut> {
  // parent_id кладём только для подкатегории: у создания null и «нет поля»
  // значат одно и то же, но так тело запроса читается однозначно.
  const payload: CategoryCreatePayload =
    parentId === null ? { name } : { name, parent_id: parentId }

  return apiRequest<CategoryOut>(API_ENDPOINTS.category, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Переименовать категорию.
 *
 * Отдельная функция от переноса намеренно: бэкенд отличает «поле не прислали»
 * от «прислали null», поэтому в теле переименования поля `parent_id` быть
 * не должно вообще — иначе категория уехала бы на верхний уровень.
 */
export async function renameCategory(
  id: number,
  name: string,
): Promise<CategoryOut> {
  const payload: CategoryUpdatePayload = { id, name }

  return apiRequest<CategoryOut>(API_ENDPOINTS.category, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

/**
 * Перенести категорию на другой уровень: `parentId = null` → наверх,
 * число → внутрь категории верхнего уровня. В новом ряду она встаёт в конец.
 */
export async function reparentCategory(
  id: number,
  parentId: number | null,
): Promise<CategoryOut> {
  const payload: CategoryUpdatePayload = { id, parent_id: parentId }

  return apiRequest<CategoryOut>(API_ENDPOINTS.category, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

/**
 * Сдвинуть категорию на одну позицию вверх/вниз внутри своего уровня.
 *
 * Ответ (`{status, id}`) не нужен: если категория уже крайняя, бэкенд отвечает
 * `status: "noop"` — это не ошибка, и делать в интерфейсе тоже нечего.
 */
export async function moveCategory(
  id: number,
  direction: MoveDirection,
): Promise<void> {
  const payload: CategoryMovePayload = { id, direction }

  await apiRequest<unknown>(API_ENDPOINTS.categoryMove, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/** Удалить категорию. Бэкенд разрешает это только для пустой (409 иначе). */
export async function deleteCategory(id: number): Promise<void> {
  await apiRequest<unknown>(`${API_ENDPOINTS.category}?id=${id}`, {
    method: 'DELETE',
  })
}

import type { CategoryOut } from '../types/api'

/**
 * Ключ строки дерева категорий.
 *
 * По нему страница понимает, в какой именно строке показывать «идёт запрос»
 * и текст ошибки: одновременно активна ровно одна строка, поэтому хватает
 * одного ключа вместо флагов у каждой категории.
 */
export function rowKey(category: CategoryOut): string {
  return `category-${category.id}`
}

/**
 * Ключ строки-формы новой категории. Своей записи у неё ещё нет, поэтому
 * ключ строится от родителя (`null` — верхний уровень).
 */
export function createRowKey(parentId: number | null): string {
  return `new-${parentId ?? 'top'}`
}

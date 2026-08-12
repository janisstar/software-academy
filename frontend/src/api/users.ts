import { apiRequest } from './client'
import type {
  ResetCode,
  UserDeletePayload,
  UserLockPayload,
  UserOut,
  UserUpdatePayload,
} from '../types/api'
import { API_ENDPOINTS } from '../constants/api'

interface FetchUsersParams {
  /** Фильтр по компании. `null` = без фильтра (доступно только master). */
  companyId: number | null
  /** Сколько записей просить у бэкенда за раз. */
  limit: number
}

/**
 * Список пользователей. Доступен привилегированным ролям; кого именно вернёт
 * бэкенд, зависит от роли: master — всех, остальным — только свою компанию.
 */
export async function fetchUsers({
  companyId,
  limit,
}: FetchUsersParams): Promise<UserOut[]> {
  // URLSearchParams сам экранирует значения — руками строку не склеиваем.
  const query = new URLSearchParams({ limit: String(limit) })

  if (companyId !== null) {
    query.set('companyid', String(companyId))
  }

  return apiRequest<UserOut[]>(`${API_ENDPOINTS.users}?${query.toString()}`, {
    method: 'GET',
  })
}

/** Один пользователь по логину. Доступен привилегированным ролям. */
export async function fetchUser(un: string): Promise<UserOut> {
  return apiRequest<UserOut>(`${API_ENDPOINTS.user}${encodeURIComponent(un)}`, {
    method: 'GET',
  })
}

/**
 * Изменить пользователя: имя, email, логин или роль.
 *
 * `un` в теле говорит, КОГО меняем; остальные поля передаём только те, что
 * действительно меняются. Смена логина — это `new_un`: после успеха адрес
 * страницы пользователя меняется вместе с ним.
 */
export async function updateUser(payload: UserUpdatePayload): Promise<UserOut> {
  return apiRequest<UserOut>(API_ENDPOINTS.user, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

/**
 * Удалить пользователя НАСОВСЕМ вместе с его данными (GDPR).
 *
 * Себя и последнего master удалить нельзя — бэкенд откажет.
 */
export async function deleteUser(un: string): Promise<{ status: string }> {
  const payload: UserDeletePayload = { un }

  return apiRequest<{ status: string }>(API_ENDPOINTS.user, {
    method: 'DELETE',
    body: JSON.stringify(payload),
  })
}

/**
 * Выдать пользователю одноразовый код сброса пароля.
 *
 * Код возвращается ОДИН раз и живёт 15 минут (точное число приходит в
 * `expires_minutes`) — передать его человеку нужно офлайн.
 */
export async function createResetCode(un: string): Promise<ResetCode> {
  return apiRequest<ResetCode>(API_ENDPOINTS.adminResetCode, {
    method: 'POST',
    body: JSON.stringify({ un }),
  })
}

/**
 * Заблокировать (`locked: true`) или разблокировать пользователя.
 *
 * Блокировка мгновенно гасит все его сессии. Себя и master заблокировать
 * нельзя — бэкенд ответит ошибкой, поэтому в интерфейсе такие переключатели
 * выключены заранее. В ответе приходит обновлённый пользователь.
 */
export async function lockUser(un: string, locked: boolean): Promise<UserOut> {
  // Псевдоним из types/api.ts: имена полей сверит компилятор.
  const payload: UserLockPayload = { un, locked }

  return apiRequest<UserOut>(API_ENDPOINTS.userLock, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

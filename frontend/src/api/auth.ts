import { apiRequest } from './client'
import type {
  ChangePasswordPayload,
  CompanyOut,
  ConsentAccepted,
  LoginResponse,
  UserOut,
} from '../types/api'
import { API_ENDPOINTS } from '../constants/api'

export async function login(un: string, pw: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>(API_ENDPOINTS.login, {
    method: 'POST',
    body: JSON.stringify({ un, pw }),
  })
}

export async function logout(): Promise<{ status: string }> {
  return apiRequest<{ status: string }>(API_ENDPOINTS.logout, {
    method: 'POST',
  })
}

export async function me(): Promise<UserOut> {
  return apiRequest<UserOut>(API_ENDPOINTS.me, {
    method: 'GET',
  })
}

/** Компания текущего пользователя: /api/me/ отдаёт только `companyid`. */
export async function userCompany(): Promise<CompanyOut> {
  return apiRequest<CompanyOut>(API_ENDPOINTS.userCompany, {
    method: 'GET',
  })
}

/**
 * Смена своего пароля (нужен старый). Снимает флаг `must_change_password`.
 *
 * Обновлённого пользователя ответ НЕ содержит, поэтому после успеха нужен
 * `refresh()` из useAuth — иначе интерфейс продолжит считать пароль временным.
 * Остальные сессии пользователя бэкенд удаляет, текущая остаётся живой.
 */
export async function changePassword(
  oldPw: string,
  newPw: string,
): Promise<{ status: string }> {
  // Псевдоним из types/api.ts: имена полей сверит компилятор.
  const payload: ChangePasswordPayload = { old_pw: oldPw, new_pw: newPw }

  return apiRequest<{ status: string }>(API_ENDPOINTS.changePassword, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/* Согласия (GDPR). Оба эндпоинта идемпотентны, тела запроса не требуют и
   возвращают только факт принятия — не пользователя, поэтому непринятые
   документы после вызова перечитываем через `refresh()`. */

export async function acceptPrivacy(): Promise<ConsentAccepted> {
  return apiRequest<ConsentAccepted>(API_ENDPOINTS.acceptPrivacy, {
    method: 'POST',
  })
}

export async function acceptTerms(): Promise<ConsentAccepted> {
  return apiRequest<ConsentAccepted>(API_ENDPOINTS.acceptTerms, {
    method: 'POST',
  })
}

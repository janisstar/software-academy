import { apiRequest } from './client'
import type { CompanyCreatePayload, CompanyOut } from '../types/api'
import { API_ENDPOINTS } from '../constants/api'

/**
 * Все компании платформы. Эндпоинт доступен только роли master — остальным
 * бэкенд отвечает 403, поэтому вызывать его следует только для master.
 *
 * Нужен там, где по `companyid` пользователя надо показать название компании:
 * в самом `UserOut` названия нет.
 */
export async function fetchCompanies(): Promise<CompanyOut[]> {
  return apiRequest<CompanyOut[]>(API_ENDPOINTS.companies, {
    method: 'GET',
  })
}

/**
 * Завести компанию-клиента. Доступно только роли master.
 *
 * Менять и удалять компании API пока не умеет — есть только создание
 * и список (docs/07-api-reference.md).
 */
export async function createCompany(
  payload: CompanyCreatePayload,
): Promise<CompanyOut> {
  return apiRequest<CompanyOut>(API_ENDPOINTS.company, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

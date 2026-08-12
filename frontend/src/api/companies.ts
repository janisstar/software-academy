import { apiRequest } from './client'
import type { CompanyOut } from '../types/api'
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

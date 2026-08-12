import { apiRequest } from './client'
import type { MasterDashboard } from '../types/api'
import { API_ENDPOINTS } from '../constants/api'

/**
 * Сводка платформы для master: компании, пользователи, контент, активность.
 *
 * Эндпоинт доступен только роли master — остальным бэкенд отвечает 403,
 * поэтому вызывать его следует, только когда активная роль = master.
 */
export async function fetchMasterDashboard(): Promise<MasterDashboard> {
  return apiRequest<MasterDashboard>(API_ENDPOINTS.masterDashboard, {
    method: 'GET',
  })
}

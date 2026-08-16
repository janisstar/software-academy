import { apiRequest } from './client'
import { API_ENDPOINTS } from '../constants/api'
import type { Dashboard } from '../types/api'

/**
 * Личный учебный дашборд: сводка прогресса и ряды continue / recommended /
 * recently, плюс признак новичка.
 *
 * Эндпоинт доступен любой сессии и считает всё ТОЛЬКО по видимым этому
 * человеку урокам: прогресс строго персональный, чужого тут не бывает
 * (docs/06). Данные грузятся один раз — поллинга в проекте нет.
 */
export async function fetchDashboard(): Promise<Dashboard> {
  return apiRequest<Dashboard>(API_ENDPOINTS.dashboard, {
    method: 'GET',
  })
}

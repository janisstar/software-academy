import { apiRequest } from './client'
import type { RoleOut } from '../types/api'
import { API_ENDPOINTS } from '../constants/api'

/**
 * Справочник ролей платформы: ключ + человеческое название.
 *
 * Названия ролей в интерфейсе берём отсюда, а не из словаря i18n: список
 * ролей задаёт бэкенд, и дублировать его на фронте — значит однажды
 * разойтись с ним.
 */
export async function fetchRoles(): Promise<RoleOut[]> {
  return apiRequest<RoleOut[]>(API_ENDPOINTS.roles, {
    method: 'GET',
  })
}

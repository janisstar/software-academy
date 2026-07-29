import type { ApiErrorDetail } from '../types/api'

/**
 * Пустая строка = запросы идут относительными путями (`/api/...`), то есть на
 * тот же адрес, с которого открыта страница. В разработке их перехватывает
 * прокси Vite (см. vite.config.ts) и передаёт на бэкенд — поэтому CORS не
 * нужен и не важно, на каком порту поднялся dev-сервер.
 * Абсолютный адрес задаётся через VITE_API_URL — только если API живёт на
 * другом домене; тогда его домен должен быть в CORS_ORIGINS на бэкенде.
 */
const DEFAULT_API_BASE_URL = ''

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? DEFAULT_API_BASE_URL

export class ApiError extends Error {
  status: number
  detail: ApiErrorDetail

  constructor(status: number, detail: ApiErrorDetail) {
    super(typeof detail === 'string' ? detail : 'Request failed')
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

async function parseApiErrorDetail(
  response: Response,
): Promise<ApiErrorDetail> {
  const text = await response.text()

  if (!text) {
    return 'Request failed'
  }

  try {
    const payload = JSON.parse(text) as { detail?: unknown }
    return Array.isArray(payload.detail)
      ? payload.detail.map((item) => String(item)).join(', ')
      : typeof payload.detail === 'string'
        ? payload.detail
        : text
  } catch {
    return text
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    const detail = await parseApiErrorDetail(response)
    throw new ApiError(response.status, detail)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export { API_BASE_URL }

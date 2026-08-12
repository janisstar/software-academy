import { ApiError } from '../api/client'

/**
 * Текст ошибки для показа человеку.
 *
 * У бэкенда сообщения содержательные («username already taken»), поэтому
 * показываем именно их — тот же приём, что на экране входа. `fallback` нужен
 * для всего остального: обрыв сети, неожиданное исключение.
 */
export function apiErrorText(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.detail : fallback
}

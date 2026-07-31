import { useCallback } from 'react'
import { useAuth } from './useAuth'

/**
 * Выход из системы и возврат на форму входа.
 *
 * Отдельный хук, потому что выйти можно из двух мест: бокового меню (десктоп)
 * и страницы Settings (мобильный). `window.location.assign` вместо navigate —
 * полная перезагрузка гарантированно сбрасывает состояние приложения.
 */
export function useLogout() {
  const { logout } = useAuth()

  return useCallback(async () => {
    await logout()
    window.location.assign('/login')
  }, [logout])
}

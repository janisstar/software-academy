import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'
import { homePathFor } from '../constants/routes'
import { useAuth } from '../hooks/useAuth'
import { activeRole } from '../types/api'
import { hasSeenLanding } from '../utils/storage'

interface LandingRouteProps {
  children: React.ReactNode
}

/**
 * Решает, что показать на "/".
 *
 * - Совсем новый посетитель — лендинг, и сразу, не дожидаясь ответа сервера:
 *   это публичная маркетинговая страница, «Loading…» на ней неуместен.
 * - Тот, кто уже входил, лендинг больше не видит. Куда его вести, решает
 *   СЕССИЯ, а не флаг в localStorage: живая → на его dashboard, истекла → на
 *   форму входа.
 *
 * Флаг `seenLanding` ставится после первого успешного входа (см. useAuth.login)
 * и отвечает ровно за один вопрос: «показывать ли лендинг человеку без сессии».
 */
export function LandingRoute({ children }: LandingRouteProps) {
  const { t } = useTranslation()
  const { user, loading } = useAuth()

  if (!hasSeenLanding() && !user) {
    return <>{children}</>
  }

  // Ждём ответ GET /api/me/, иначе вошедшего пользователя на миг увело бы
  // на /login — сессия ещё не успела бы подтвердиться.
  if (loading) {
    return <div>{t('common.loading')}</div>
  }

  return (
    <Navigate
      to={user ? homePathFor(activeRole(user.privileges)) : '/login'}
      replace
    />
  )
}

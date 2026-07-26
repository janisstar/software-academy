import { Navigate } from 'react-router-dom'
import { hasSeenLanding } from '../utils/storage'

interface LandingRouteProps {
  children: React.ReactNode
}

/**
 * Лендинг нужен только до первого входа: если пользователь уже входил
 * (флаг в localStorage), "/" сразу ведёт на форму логина.
 */
export function LandingRoute({ children }: LandingRouteProps) {
  if (hasSeenLanding()) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

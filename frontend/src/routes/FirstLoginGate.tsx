import { Navigate } from 'react-router-dom'
import { FIRST_LOGIN_PATHS } from '../constants/routes'
import { useAuth } from '../hooks/useAuth'
import { nextFirstLoginStep } from '../utils/firstLogin'

interface FirstLoginGateProps {
  children: React.ReactNode
}

/**
 * Не пускает в портал, пока не закрыт первый вход: сначала смена временного
 * пароля, потом согласия (docs/07-api-reference.md).
 *
 * Ставится ВНУТРЬ ProtectedRoute, а не вместо него: сессию проверяет тот, шаги
 * — этот. Благодаря такому разделению сами экраны /first-login/* могут взять
 * ProtectedRoute без шлюза и не отправлять себя на самих себя.
 *
 * Своих запросов не делает — пользователь уже есть в useAuth.
 */
export function FirstLoginGate({ children }: FirstLoginGateProps) {
  const { user } = useAuth()

  const step = nextFirstLoginStep(user)
  if (step) {
    return <Navigate to={FIRST_LOGIN_PATHS[step]} replace />
  }

  return <>{children}</>
}

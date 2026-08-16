import { useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { FIRST_LOGIN_PATHS, homePathFor } from '../../constants/routes'
import { useAuth } from '../../hooks/useAuth'
import type { FirstLoginOutletContext } from '../../hooks/useFirstLoginProgress'
import { activeRole } from '../../types/api'
import {
  nextFirstLoginStep,
  requiredFirstLoginSteps,
} from '../../utils/firstLogin'
import { AuthShell } from './AuthShell'

/**
 * Общая обвязка экранов первого входа: держит порядок шагов и сама уводит
 * дальше, когда шаг закрыт.
 *
 * Живёт на роуте-родителе обоих экранов, поэтому проверка написана один раз, а
 * не продублирована на каждой странице. Сессию к этому моменту уже проверил
 * ProtectedRoute; шлюза FirstLoginGate здесь НЕТ намеренно — иначе он
 * отправлял бы страницы шагов на самих себя.
 */
export function FirstLoginLayout() {
  const { user } = useAuth()
  const location = useLocation()

  // Снимок шагов делаем ОДИН раз, на входе в сценарий: после смены пароля
  // флаг must_change_password уже снят, и «шаг 2 из 2» посчитать было бы не
  // из чего. При переходе между дочерними роутами лэйаут не размонтируется,
  // поэтому снимок живёт до конца первого входа.
  const [steps] = useState(() => requiredFirstLoginSteps(user))

  const step = nextFirstLoginStep(user)

  // Проходить нечего — в том числе если экран открыли руками. В портал той
  // роли, которая вошла: сам сценарий первого входа при этом не меняется.
  if (!step) {
    return (
      <Navigate
        to={homePathFor(user ? activeRole(user.privileges) : null)}
        replace
      />
    )
  }

  // Открыт не тот шаг — или текущий только что завершён и refresh() снял флаг.
  // Уводим на актуальный: это и есть переход «пароль → согласия».
  const target = FIRST_LOGIN_PATHS[step]
  if (location.pathname !== target) {
    return <Navigate to={target} replace />
  }

  const context: FirstLoginOutletContext = { steps }

  return (
    <AuthShell>
      <Outlet context={context} />
    </AuthShell>
  )
}

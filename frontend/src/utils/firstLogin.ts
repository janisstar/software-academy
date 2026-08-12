import type { UserOut } from '../types/api'

/**
 * Первый вход: пока он не закрыт, пользователя не пускают в портал.
 *
 * Порядок шагов зафиксирован в docs/07-api-reference.md: сначала смена
 * временного пароля, потом согласия. Здесь он выражен один раз — этими
 * функциями пользуются и шлюз (routes/FirstLoginGate), и обвязка самих
 * экранов (components/login/FirstLoginLayout), чтобы правило не разъехалось.
 */

export type FirstLoginStep = 'password' | 'consents'

/** Шаги, которые пользователю предстоят СЕЙЧАС, в обязательном порядке. */
export function requiredFirstLoginSteps(user: UserOut | null): FirstLoginStep[] {
  if (!user) {
    return []
  }

  const steps: FirstLoginStep[] = []

  if (user.must_change_password) {
    steps.push('password')
  }

  if (user.pending_consents.length > 0) {
    steps.push('consents')
  }

  return steps
}

/** Текущий шаг или null, если первый вход уже пройден. */
export function nextFirstLoginStep(user: UserOut | null): FirstLoginStep | null {
  return requiredFirstLoginSteps(user)[0] ?? null
}

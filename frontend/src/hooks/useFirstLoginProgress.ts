import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router-dom'
import type { FirstLoginStep } from '../utils/firstLogin'

/** Что FirstLoginLayout передаёт экранам шагов через <Outlet context={…} />. */
export interface FirstLoginOutletContext {
  /** Снимок шагов, снятый при входе в сценарий (см. FirstLoginLayout). */
  steps: FirstLoginStep[]
}

interface FirstLoginProgress {
  /** Сколько шагов всего. */
  total: number
  /** Номер текущего шага, считая с 1. */
  current: number
  /** Готовая подпись над заголовком карточки. */
  eyebrow: string
}

/**
 * Прогресс первого входа для конкретного шага.
 *
 * Считать его от текущего пользователя нельзя: после смены пароля флаг
 * `must_change_password` уже снят, и «шаг 2 из 2» было бы не из чего вывести.
 * Поэтому берём снимок шагов, сделанный лэйаутом на входе в сценарий.
 */
export function useFirstLoginProgress(step: FirstLoginStep): FirstLoginProgress {
  const { t } = useTranslation()
  const { steps } = useOutletContext<FirstLoginOutletContext>()

  const total = steps.length
  const current = steps.indexOf(step) + 1

  return {
    total,
    current,
    // Шаг всего один (например, пароль менять не нужно — остались согласия):
    // «шаг 1 из 1» и полоска прогресса только мешают, поэтому просто подпись.
    eyebrow:
      total > 1
        ? t('firstLogin.step', { current, total })
        : t('firstLogin.eyebrow'),
  }
}

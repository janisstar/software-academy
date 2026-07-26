import { SEEN_LANDING_KEY } from '../constants/storage'

/**
 * localStorage может быть недоступен (приватный режим, отключённые cookies),
 * поэтому каждое обращение обёрнуто в try/catch: лендинг не должен ронять
 * приложение.
 */

export function hasSeenLanding(): boolean {
  try {
    return localStorage.getItem(SEEN_LANDING_KEY) === '1'
  } catch {
    return false
  }
}

export function markLandingSeen(): void {
  try {
    localStorage.setItem(SEEN_LANDING_KEY, '1')
  } catch {
    // Флаг — только удобство: без него пользователь просто снова увидит лендинг.
  }
}

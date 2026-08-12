import { isLocked, type UserOut } from '../types/api'

/** Состояние аккаунта в списке пользователей. */
export type UserStatus = 'active' | 'pending' | 'locked'

/**
 * Статус пользователя для списка.
 *
 * Порядок проверок важен: блокировка перевешивает незакрытый первый вход —
 * заблокированный пользователь всё равно не войдёт, и показывать ему
 * «Pending first login» было бы враньём.
 */
export function userStatus(user: UserOut): UserStatus {
  if (isLocked(user.privileges)) {
    return 'locked'
  }

  if (user.must_change_password) {
    return 'pending'
  }

  return 'active'
}

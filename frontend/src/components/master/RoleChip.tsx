import { Chip } from '../ui/Chip'
import type { RoleKey } from '../../types/api'
import styles from './RoleChip.module.css'

type RoleChipProps = {
  /** Ключ роли; `null` — если в privileges не оказалось ни одной роли. */
  role: RoleKey | null
  /**
   * Название роли для человека. Приходит с бэкенда (GET /api/roles/), а не из
   * словаря i18n: список ролей задаёт бэкенд.
   */
  name: string
}

/**
 * Пилюля роли. Своей вёрстки нет — берём общий ui/Chip и только подставляем
 * ему цвета роли через переменные --chip-bg / --chip-text.
 */
export function RoleChip({ role, name }: RoleChipProps) {
  return <Chip className={role ? styles[role] : undefined}>{name}</Chip>
}

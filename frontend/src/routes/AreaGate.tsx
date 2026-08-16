import { Navigate } from 'react-router-dom'
import { homePathFor } from '../constants/routes'
import { useAuth } from '../hooks/useAuth'
import { activeRole, canManagePeople, type RoleKey } from '../types/api'

/**
 * Какую область закрывает шлюз:
 * - `master` — интерфейс вендора (боковая панель);
 * - `app` — учебная область (верхняя шапка);
 * - `people` — раздел People. Это не третий интерфейс, а раздел, общий для
 *   двух первых: master открывает его у себя, admin / manager / site — внутри
 *   учебной оболочки. Кто именно допущен, решает `canManagePeople`.
 */
type Area = 'master' | 'app' | 'people'

interface AreaGateProps {
  area: Area
  /**
   * Куда увести того, кому сюда нельзя. По умолчанию — корень его
   * собственного интерфейса. Задаётся там, где осмысленнее вернуть человека
   * в соседний раздел, а не в самое начало (например с Companies — обратно
   * к списку пользователей).
   */
  redirectTo?: string
  children: React.ReactNode
}

/** Допущена ли роль в область. */
function belongsTo(area: Area, role: RoleKey | null): boolean {
  switch (area) {
    case 'master':
      return role === 'master'
    case 'app':
      return role !== 'master'
    case 'people':
      return canManagePeople(role)
  }
}

/**
 * Не пускает роль туда, где ей нечего делать: master работает только в своей
 * области, остальные роли — только в учебной, а раздел People открыт лишь
 * тем, кто ведёт людей.
 *
 * Пришедшего не по адресу уводим на его собственный корень (или на
 * `redirectTo`), а не на «нет страницы»: адрес существует, просто он не для
 * этой роли.
 *
 * Ставится ВНУТРЬ ProtectedRoute и FirstLoginGate: сессию проверяет первый,
 * незакрытый первый вход — второй, а роль — этот. Своих запросов не делает,
 * пользователь уже есть в useAuth.
 *
 * Шлюз отвечает только на вопрос «пускать ли». Какую ОБОЛОЧКУ показать
 * допущенному, решает `ByRole`.
 */
export function AreaGate({ area, redirectTo, children }: AreaGateProps) {
  const { user } = useAuth()

  const role = user ? activeRole(user.privileges) : null

  if (!belongsTo(area, role)) {
    return <Navigate to={redirectTo ?? homePathFor(role)} replace />
  }

  return <>{children}</>
}

import { useEffect, useState } from 'react'
import { fetchCompanies } from '../api/companies'
import { fetchRoles } from '../api/roles'
import type { CompanyOut, RoleOut } from '../types/api'

interface Directories {
  /** Роли платформы: ключ + человеческое название. */
  roles: RoleOut[]
  /** Компании: пусто, если их не запрашивали или запрос не удался. */
  companies: CompanyOut[]
}

/**
 * Справочники, которыми подписываются данные пользователя: названия ролей и
 * названия компаний. Нужны и списку пользователей, и странице одного.
 *
 * Грузятся один раз и живут отдельно от основного запроса страницы: их
 * ошибку намеренно глотаем — страница обязана работать и без них (без ролей
 * покажем ключ роли, без компаний — просто не будет названия компании).
 *
 * `withCompanies` есть потому, что `GET /api/companies/` доступен только
 * роли master: остальным запрос не шлём, чтобы не ловить 403.
 *
 * `enabled` выключает справочники целиком — на страницах, куда роль вообще
 * не пускают: там вместо содержимого стоит заглушка, и запросы ей не нужны.
 * Тот же приём, что у `useCategoriesTree` и `useMasterLessons`.
 */
export function useDirectories(
  withCompanies: boolean,
  enabled = true,
): Directories {
  const [roles, setRoles] = useState<RoleOut[]>([])
  const [companies, setCompanies] = useState<CompanyOut[]>([])

  useEffect(() => {
    if (!enabled) {
      return
    }

    let isActive = true

    void (async () => {
      const [loadedRoles, loadedCompanies] = await Promise.all([
        fetchRoles().catch(() => []),
        withCompanies ? fetchCompanies().catch(() => []) : Promise.resolve([]),
      ])

      if (isActive) {
        setRoles(loadedRoles)
        setCompanies(loadedCompanies)
      }
    })()

    return () => {
      isActive = false
    }
  }, [withCompanies, enabled])

  return { roles, companies }
}

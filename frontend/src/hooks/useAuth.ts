import { createContext, useContext } from 'react'
import type { CompanyOut, LoginResponse, UserOut } from '../types/api'

/**
 * Контекст авторизации и хук доступа к нему.
 *
 * Провайдер живёт отдельно, в `AuthProvider.tsx`. Разделение не косметическое:
 * если в одном файле лежат и компонент, и хук, ломается Fast Refresh —
 * правка хука перезагружает всё дерево вместо горячей замены компонента
 * (правило eslint `react-refresh/only-export-components`).
 */

export interface AuthContextValue {
  user: UserOut | null
  /**
   * Компания текущего пользователя. `null`, пока идёт загрузка, для гостя —
   * и в том случае, если запрос названия не удался: интерфейс должен
   * работать и без него.
   */
  company: CompanyOut | null
  loading: boolean
  login: (un: string, pw: string) => Promise<LoginResponse>
  logout: () => Promise<void>
  refresh: () => Promise<UserOut | null>
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}

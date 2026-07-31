import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { ApiError } from '../api/client'
import {
  login as loginRequest,
  logout as logoutRequest,
  me as meRequest,
  userCompany as companyRequest,
} from '../api/auth'
import type { CompanyOut, UserOut } from '../types/api'
import { markLandingSeen } from '../utils/storage'
import { AuthContext, type AuthContextValue } from './useAuth'

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<UserOut | null>(null)
  const [company, setCompany] = useState<CompanyOut | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      // Название компании отдаёт отдельный эндпоинт (/api/me/ возвращает
      // только companyid), поэтому запрашиваем параллельно — иначе ожидание
      // на старте приложения удвоилось бы.
      // Название — украшение: если запрос не прошёл, интерфейс работает без него.
      const [nextUser, nextCompany] = await Promise.all([
        meRequest(),
        companyRequest().catch(() => null),
      ])

      setUser(nextUser)
      setCompany(nextCompany)
      return nextUser
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setUser(null)
        setCompany(null)
        return null
      }

      setUser(null)
      setCompany(null)
      return null
    }
  }, [])

  useEffect(() => {
    let isActive = true

    void (async () => {
      try {
        const nextUser = await refresh()
        if (!isActive) {
          return
        }

        setUser(nextUser)
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    })()

    return () => {
      isActive = false
    }
  }, [refresh])

  const login = useCallback(async (un: string, pw: string) => {
    const response = await loginRequest(un, pw)
    setUser(response.user)
    // Ответ логина уже содержит компанию — отдельный запрос не нужен.
    setCompany(response.company)

    // Вход завершён только когда не осталось соглашений к принятию —
    // тогда лендинг больше не показываем.
    if (response.user.pending_consents.length === 0) {
      markLandingSeen()
    }

    return response
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } finally {
      setUser(null)
      setCompany(null)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      company,
      loading,
      login,
      logout,
      refresh,
    }),
    [company, loading, login, logout, refresh, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

import {
  createContext,
  useCallback,
  useContext,
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
} from '../api/auth'
import type { LoginResponse, UserOut } from '../types/api'
import { markLandingSeen } from '../utils/storage'

interface AuthContextValue {
  user: UserOut | null
  loading: boolean
  login: (un: string, pw: string) => Promise<LoginResponse>
  logout: () => Promise<void>
  refresh: () => Promise<UserOut | null>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<UserOut | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const nextUser = await meRequest()
      setUser(nextUser)
      return nextUser
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setUser(null)
        return null
      }

      setUser(null)
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
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login,
      logout,
      refresh,
    }),
    [loading, login, logout, refresh, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}

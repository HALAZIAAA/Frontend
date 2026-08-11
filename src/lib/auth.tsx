import { createContext, useContext, useEffect, useState } from 'react'
import { apiLogin, apiLogout, apiMe, apiSignup, type AuthUser } from '../api/authApi'

type AuthResult = { ok: boolean; error?: string }

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<AuthResult>
  signup: (name: string, email: string, password: string) => Promise<AuthResult>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // 페이지가 열릴 때 서버에 "나 로그인돼 있어?"를 물어 복원한다.
  useEffect(() => {
    apiMe()
      .then((me) => setUser(me))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const me = await apiLogin(email, password)
      setUser(me)
      return { ok: true }
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : '로그인에 실패했습니다.',
      }
    }
  }

  const signup = async (
    name: string,
    email: string,
    password: string,
  ): Promise<AuthResult> => {
    try {
      const me = await apiSignup(name, email, password)
      setUser(me) // 가입 즉시 자동 로그인 (백엔드가 쿠키 발급)
      return { ok: true }
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : '회원가입에 실패했습니다.',
      }
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await apiLogout()
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
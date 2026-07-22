import { createContext, useContext, useState } from 'react'
import { CURRENT_USER } from './currentUser'

type User = typeof CURRENT_USER

type AuthContextValue = {
  user: User | null
  login: (email: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = 'bridgeon_auth_user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? (JSON.parse(stored) as User) : null
    } catch {
      return null
    }
  })

  const login = (email: string, password: string): boolean => {
    if (email === CURRENT_USER.email && password.trim().length > 0) {
      setUser(CURRENT_USER)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(CURRENT_USER))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

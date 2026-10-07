import { createContext, useContext } from 'react'
import type { AuthUser } from '../api/authApi'

export type AuthResult = { ok: boolean; error?: string }

export type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<AuthResult>
  loginWithGoogle: (credential: string) => Promise<AuthResult>
  signup: (email: string, password: string) => Promise<AuthResult>
  updateNickname: (nickname: string) => Promise<AuthResult>
  changePassword: (currentPassword: string, newPassword: string) => Promise<AuthResult>
  deleteAccount: (password: string | null) => Promise<AuthResult>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
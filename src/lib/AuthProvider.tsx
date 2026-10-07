import { useEffect, useState } from 'react'
import {
  apiGoogleLogin,
  apiLogin,
  apiLogout,
  apiMe,
  apiChangePassword,
  apiDeleteAccount,
  apiSignup,
  apiUpdateNickname,
  type AuthUser,
} from '../api/authApi'
import { AuthContext, type AuthResult } from './auth'

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

  const loginWithGoogle = async (credential: string): Promise<AuthResult> => {
    try {
      const me = await apiGoogleLogin(credential)
      setUser(me)
      return { ok: true }
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : '구글 로그인에 실패했습니다.',
      }
    }
  }

  const signup = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const me = await apiSignup(email, password)
      setUser(me) // 가입 즉시 자동 로그인 (백엔드가 쿠키 발급)
      return { ok: true }
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : '회원가입에 실패했습니다.',
      }
    }
  }

  const updateNickname = async (nickname: string): Promise<AuthResult> => {
    try {
      const me = await apiUpdateNickname(nickname)
      setUser(me)
      return { ok: true }
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : '닉네임 변경에 실패했습니다.',
      }
    }
  }

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ): Promise<AuthResult> => {
    try {
      await apiChangePassword(currentPassword, newPassword)
      return { ok: true }
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : '비밀번호 변경에 실패했습니다.',
      }
    }
  }

  const deleteAccount = async (password: string | null): Promise<AuthResult> => {
    try {
      await apiDeleteAccount(password)
      setUser(null) // 서버가 쿠키까지 비웠으니 바로 로그아웃 상태로
      return { ok: true }
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : '회원 탈퇴에 실패했습니다.',
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
    <AuthContext.Provider value={{
        user,
        loading,
        login,
        signup,
        loginWithGoogle,
        updateNickname,
        changePassword,
        deleteAccount,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  )
}

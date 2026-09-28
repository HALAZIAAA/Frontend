import { BACKEND_ORIGIN } from './fileApi'

const AUTH_BASE = `${BACKEND_ORIGIN}/api/v1/auth`

export type AuthUser = {
  id: number
  email: string
  nickname: string
  role: string
  provider: string
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { detail?: string; message?: string }
    return data.detail ?? data.message ?? `요청 실패 (${res.status})`
  } catch {
    return `요청 실패 (${res.status})`
  }
}

export async function apiSignup(email: string, password: string): Promise<AuthUser> {
  const res = await fetch(`${AUTH_BASE}/signup`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return (await res.json()) as AuthUser
}

export async function apiLogin(email: string, password: string): Promise<AuthUser> {
  const res = await fetch(`${AUTH_BASE}/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return (await res.json()) as AuthUser
}

export async function apiGoogleLogin(credential: string): Promise<AuthUser> {
  const res = await fetch(`${AUTH_BASE}/google`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return (await res.json()) as AuthUser
}

export async function apiLogout(): Promise<void> {
  const res = await fetch(`${AUTH_BASE}/logout`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) throw new Error(await parseError(res))
}

export async function apiMe(): Promise<AuthUser | null> {
  const res = await fetch(`${AUTH_BASE}/me`, {
    method: 'GET',
    credentials: 'include',
  })
  if (res.status === 401) return null
  if (!res.ok) throw new Error(await parseError(res))
  return (await res.json()) as AuthUser
}

export async function apiUpdateNickname(nickname: string): Promise<AuthUser> {
  const res = await fetch(`${AUTH_BASE}/me/nickname`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickname }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return (await res.json()) as AuthUser
}

// 회원 탈퇴. 비밀번호가 있는 계정은 확인용으로 함께 보낸다.
export async function apiDeleteAccount(password: string | null): Promise<void> {
  const res = await fetch(`${AUTH_BASE}/me`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  if (!res.ok) throw new Error(await parseError(res))
}

// 비밀번호 변경. 성공하면 다른 기기의 로그인만 끊긴다.
export async function apiChangePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const res = await fetch(`${AUTH_BASE}/me/password`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  })
  if (!res.ok) throw new Error(await parseError(res))
}

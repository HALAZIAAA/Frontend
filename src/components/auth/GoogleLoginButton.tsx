import { useEffect, useRef } from 'react'
import { useAuth } from '../../lib/auth'

declare global {
  interface Window {
    google?: any
  }
}

type GoogleLoginButtonProps = {
  onSuccess: () => void
  onError: (message: string) => void
}

function GoogleLoginButton({ onSuccess, onError }: GoogleLoginButtonProps) {
  const divRef = useRef<HTMLDivElement>(null)
  const { loginWithGoogle } = useAuth()

  useEffect(() => {
    let cancelled = false

    // GIS 스크립트(async)가 아직 로드 전일 수 있어 준비될 때까지 기다린다.
    const tryInit = () => {
      if (cancelled) return
      if (!window.google?.accounts?.id || !divRef.current) {
        setTimeout(tryInit, 100)
        return
      }
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: async (resp: { credential: string }) => {
          const result = await loginWithGoogle(resp.credential)
          if (result.ok) {
            onSuccess()
          } else {
            onError(result.error ?? '구글 로그인에 실패했습니다.')
          }
        },
      })
      window.google.accounts.id.renderButton(divRef.current, {
        theme: 'outline',
        size: 'large',
        width: 400, // GIS가 허용하는 최대 폭. 나머지는 CSS scale로 카드 폭에 맞춘다.
        text: 'continue_with',
      })
    }
    tryInit()

    return () => {
      cancelled = true
    }
  }, [])

  return <div ref={divRef} className="google-login-button" />
}

export default GoogleLoginButton
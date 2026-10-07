import { useEffect, useRef } from 'react'
import { useAuth } from '../../lib/auth'

declare global {
  interface Window {
    // GIS 스크립트가 로드되기 전에는 없으므로 optional. 실제로 쓰는 두 함수만 적는다.
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (resp: { credential: string }) => void
          }) => void
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void
        }
      }
    }
  }
}

type GoogleLoginButtonProps = {
  onSuccess: () => void
  onError: (message: string) => void
}

function GoogleLoginButton({ onSuccess, onError }: GoogleLoginButtonProps) {
  const divRef = useRef<HTMLDivElement>(null)
  const { loginWithGoogle } = useAuth()
  // 버튼은 한 번만 초기화하므로, GIS 콜백이 늘 최신 함수를 부르도록 ref에 담아 둔다.
  const latestRef = useRef({ loginWithGoogle, onSuccess, onError })
  useEffect(() => {
    latestRef.current = { loginWithGoogle, onSuccess, onError }
  })

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
          const { loginWithGoogle, onSuccess, onError } = latestRef.current
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
        // GIS가 허용하는 최대 폭은 400. 좁은 화면에서는 카드 안쪽 폭에 맞춰 그려야 가로로 넘치지 않는다.
        width: Math.min(400, divRef.current.offsetWidth),
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
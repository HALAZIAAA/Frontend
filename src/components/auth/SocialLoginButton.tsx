import type { ReactNode } from 'react'

type SocialProvider = 'google' | 'kakao'

type SocialLoginButtonProps = {
  provider: SocialProvider
  label: string
  onClick: () => void
}

function SocialLoginButton({ provider, label, onClick }: SocialLoginButtonProps) {
  const icon: ReactNode =
    provider === 'google' ? (
      <svg className="social-button-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="#EA4335" strokeWidth="1.8" />
        <path d="M7.5 12H12.5" stroke="#EA4335" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12.5 12H16.5C16.3 14.6 14.6 16.2 12 16.2C9.7 16.2 7.8 14.3 7.8 12C7.8 9.7 9.7 7.8 12 7.8C13.2 7.8 14.1 8.2 14.8 8.9" stroke="#EA4335" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ) : (
      <span className="social-button-kakao-icon" aria-hidden="true">
        K
      </span>
    )

  return (
    <button type="button" className={`social-login-button is-${provider}`} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  )
}

export default SocialLoginButton

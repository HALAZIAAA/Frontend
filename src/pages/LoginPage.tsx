import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout'
import AuthDivider from '../components/auth/AuthDivider'
import SocialLoginButton from '../components/auth/SocialLoginButton'
import '../styles/navbar.css'
import '../styles/auth.css'

type LoginFormState = {
  email: string
  password: string
  keepSignedIn: boolean
}

type LoginFormErrors = {
  email?: string
  password?: string
}

function LoginPage() {
  const [formState, setFormState] = useState<LoginFormState>({
    email: '',
    password: '',
    keepSignedIn: false,
  })
  const [errors, setErrors] = useState<LoginFormErrors>({})
  const [submitMessage, setSubmitMessage] = useState<string>('')
  const [socialMessage, setSocialMessage] = useState<string>('')

  const handleTextInputChange =
    (field: 'email' | 'password') =>
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      const { value } = event.target
      setFormState((prevState) => ({
        ...prevState,
        [field]: value,
      }))
    }

  const handleKeepSignedInChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setFormState((prevState) => ({
      ...prevState,
      keepSignedIn: event.target.checked,
    }))
  }

  const validate = (): LoginFormErrors => {
    const nextErrors: LoginFormErrors = {}
    if (!formState.email.trim()) {
      nextErrors.email = '이메일을 입력해주세요.'
    }
    if (!formState.password.trim()) {
      nextErrors.password = '비밀번호를 입력해주세요.'
    }
    return nextErrors
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    setSocialMessage('')

    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      setSubmitMessage('')
      return
    }

    // TODO: 추후 백엔드 일반 로그인 API가 추가되면 여기에서 실제 로그인 요청을 연결한다.
    setSubmitMessage('현재는 프론트 UI만 구현된 상태입니다.')
  }

  const handleGoogleLogin = (): void => {
    // TODO: 백엔드 Google OAuth API 추가 후 연동 예정 (예: /auth/google/login).
    setSocialMessage('Google 로그인은 현재 준비 중입니다.')
  }

  return (
    <AuthLayout title="로그인">
      <SocialLoginButton provider="google" label="Google로 로그인" onClick={handleGoogleLogin} />

      <AuthDivider />

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label className="auth-field-label" htmlFor="login-email">
          이메일
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          className="auth-input"
          value={formState.email}
          onChange={handleTextInputChange('email')}
          placeholder="email@example.com"
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email && <p className="auth-error-message">{errors.email}</p>}

        <label className="auth-field-label" htmlFor="login-password">
          비밀번호
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          className="auth-input"
          value={formState.password}
          onChange={handleTextInputChange('password')}
          placeholder="********"
          aria-invalid={Boolean(errors.password)}
        />
        {errors.password && <p className="auth-error-message">{errors.password}</p>}

        <div className="auth-meta-row">
          <label className="auth-checkbox-label" htmlFor="keep-signed-in">
            <input
              id="keep-signed-in"
              name="keepSignedIn"
              type="checkbox"
              checked={formState.keepSignedIn}
              onChange={handleKeepSignedInChange}
            />
            로그인 상태 유지
          </label>
          <button type="button" className="auth-text-button">
            비밀번호 찾기
          </button>
        </div>

        <button type="submit" className="auth-primary-button">
          로그인
        </button>
      </form>

      {(submitMessage || socialMessage) && (
        <p className="auth-feedback-message">{submitMessage || socialMessage}</p>
      )}

      <p className="auth-switch-text">
        계정이 없으신가요?{' '}
        <Link to="/signup" className="auth-switch-link">
          회원가입
        </Link>
      </p>
    </AuthLayout>
  )
}

export default LoginPage

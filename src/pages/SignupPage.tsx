import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout'
import AuthDivider from '../components/auth/AuthDivider'
import SocialLoginButton from '../components/auth/SocialLoginButton'
import '../styles/navbar.css'
import '../styles/auth.css'

type SignupFormState = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

type SignupFormErrors = {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

function SignupPage() {
  const [formState, setFormState] = useState<SignupFormState>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<SignupFormErrors>({})
  const [submitMessage, setSubmitMessage] = useState<string>('')
  const [socialMessage, setSocialMessage] = useState<string>('')

  const handleChange =
    (field: keyof SignupFormState) =>
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      const { value } = event.target
      setFormState((prevState) => ({
        ...prevState,
        [field]: value,
      }))
    }

  const validate = (): SignupFormErrors => {
    const nextErrors: SignupFormErrors = {}
    if (!formState.name.trim()) {
      nextErrors.name = '이름을 입력해주세요.'
    }
    if (!formState.email.trim()) {
      nextErrors.email = '이메일을 입력해주세요.'
    }
    if (!formState.password.trim()) {
      nextErrors.password = '비밀번호를 입력해주세요.'
    }
    if (formState.password !== formState.confirmPassword) {
      nextErrors.confirmPassword = '비밀번호가 일치하지 않습니다.'
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

    // TODO: 추후 백엔드 회원가입 API가 추가되면 여기에서 실제 회원가입 요청을 연결한다.
    setSubmitMessage('현재는 프론트 UI만 구현된 상태입니다.')
  }

  const handleGoogleSignup = (): void => {
    // TODO: 백엔드 Google OAuth API 추가 후 연동 예정 (예: /auth/google/login).
    setSocialMessage('Google 회원가입은 현재 준비 중입니다.')
  }

  return (
    <AuthLayout title="회원가입">
      <SocialLoginButton provider="google" label="Google로 회원가입" onClick={handleGoogleSignup} />

      <AuthDivider />

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label className="auth-field-label" htmlFor="signup-name">
          이름
        </label>
        <input
          id="signup-name"
          name="name"
          type="text"
          className="auth-input"
          value={formState.name}
          onChange={handleChange('name')}
          placeholder="홍길동"
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name && <p className="auth-error-message">{errors.name}</p>}

        <label className="auth-field-label" htmlFor="signup-email">
          이메일
        </label>
        <input
          id="signup-email"
          name="email"
          type="email"
          className="auth-input"
          value={formState.email}
          onChange={handleChange('email')}
          placeholder="email@example.com"
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email && <p className="auth-error-message">{errors.email}</p>}

        <label className="auth-field-label" htmlFor="signup-password">
          비밀번호
        </label>
        <input
          id="signup-password"
          name="password"
          type="password"
          className="auth-input"
          value={formState.password}
          onChange={handleChange('password')}
          placeholder="********"
          aria-invalid={Boolean(errors.password)}
        />
        {errors.password && <p className="auth-error-message">{errors.password}</p>}

        <label className="auth-field-label" htmlFor="signup-confirm-password">
          비밀번호 확인
        </label>
        <input
          id="signup-confirm-password"
          name="confirmPassword"
          type="password"
          className="auth-input"
          value={formState.confirmPassword}
          onChange={handleChange('confirmPassword')}
          placeholder="********"
          aria-invalid={Boolean(errors.confirmPassword)}
        />
        {errors.confirmPassword && <p className="auth-error-message">{errors.confirmPassword}</p>}

        <button type="submit" className="auth-primary-button">
          회원가입
        </button>
      </form>

      {(submitMessage || socialMessage) && (
        <p className="auth-feedback-message">{submitMessage || socialMessage}</p>
      )}

      <p className="auth-switch-text">
        이미 계정이 있으신가요?{' '}
        <Link to="/login" className="auth-switch-link">
          로그인
        </Link>
      </p>
    </AuthLayout>
  )
}

export default SignupPage

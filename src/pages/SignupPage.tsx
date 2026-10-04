import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout'
import AuthDivider from '../components/auth/AuthDivider'
import GoogleLoginButton from '../components/auth/GoogleLoginButton'
import { useAuth } from '../lib/auth'
import '../styles/navbar.css'
import '../styles/auth.css'
import { useDocumentTitle } from '../lib/useDocumentTitle'

type SignupFormState = {
  email: string
  password: string
  confirmPassword: string
}

type SignupFormErrors = {
  email?: string
  password?: string
  confirmPassword?: string
}

function SignupPage() {
  useDocumentTitle('회원가입')
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [formState, setFormState] = useState<SignupFormState>({
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setSocialMessage('')

    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      setSubmitMessage('')
      // 틀린 첫 칸으로 옮겨서 무엇을 고쳐야 하는지 바로 듣게 한다.
      const firstField = validationErrors.email
        ? 'email'
        : validationErrors.password
          ? 'password'
          : 'confirm-password'
      document.getElementById(`signup-${firstField}`)?.focus()
      return
    }

    setSubmitMessage('')

    const result = await signup(formState.email, formState.password)
    if (result.ok) {
      navigate('/') // 가입 즉시 자동 로그인 → 홈으로
    } else {
      setSubmitMessage(result.error ?? '회원가입에 실패했습니다.')
    }
  }

  return (
    <AuthLayout title="회원가입">
      <GoogleLoginButton
        onSuccess={() => navigate('/')}
        onError={(message) => setSocialMessage(message)}
      />

      <AuthDivider />

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
          aria-describedby={errors.email ? 'signup-email-error' : undefined}
        />
        {errors.email && (
          <p id="signup-email-error" className="auth-error-message">
            {errors.email}
          </p>
        )}

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
          aria-describedby={errors.password ? 'signup-password-error' : undefined}
        />
        {errors.password && (
          <p id="signup-password-error" className="auth-error-message">
            {errors.password}
          </p>
        )}

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
          aria-describedby={errors.confirmPassword ? 'signup-confirm-password-error' : undefined}
        />
        {errors.confirmPassword && (
          <p id="signup-confirm-password-error" className="auth-error-message">
            {errors.confirmPassword}
          </p>
        )}

        <button type="submit" className="auth-primary-button">
          회원가입
        </button>
      </form>

      {/* 빈 상태로도 늘 자리를 둬야 스크린리더가 나중에 들어온 실패 안내를 읽는다 */}
      <div role="alert">
        {(submitMessage || socialMessage) && (
          <p className="auth-feedback-message">{submitMessage || socialMessage}</p>
        )}
      </div>

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

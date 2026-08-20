import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout'
import AuthDivider from '../components/auth/AuthDivider'
import GoogleLoginButton from '../components/auth/GoogleLoginButton'
import { useAuth } from '../lib/auth'
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
  const { signup } = useAuth()
  const navigate = useNavigate()
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setSocialMessage('')

    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      setSubmitMessage('')
      return
    }

    const result = await signup(formState.name, formState.email, formState.password)
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

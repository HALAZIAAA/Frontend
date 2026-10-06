import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout'
import AuthDivider from '../components/auth/AuthDivider'
import GoogleLoginButton from '../components/auth/GoogleLoginButton'
import PasswordInput from '../components/auth/PasswordInput'
import { useAuth } from '../lib/auth'
import '../styles/navbar.css'
import '../styles/auth.css'
import { useDocumentTitle } from '../lib/useDocumentTitle'

type LoginFormState = {
  email: string
  password: string
}

type LoginFormErrors = {
  email?: string
  password?: string
}

function LoginPage() {
  useDocumentTitle('로그인')
  const { login } = useAuth()
  const navigate = useNavigate()
  const [formState, setFormState] = useState<LoginFormState>({
    email: '',
    password: '',
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setSocialMessage('')

    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      setSubmitMessage('')
      // 틀린 첫 칸으로 옮겨서 무엇을 고쳐야 하는지 바로 듣게 한다.
      const firstField = validationErrors.email ? 'email' : 'password'
      document.getElementById(`login-${firstField}`)?.focus()
      return
    }

    setSubmitMessage('')

    const result = await login(formState.email, formState.password)
    if (result.ok) {
      navigate('/')
    } else {
      setSubmitMessage(result.error ?? '이메일 또는 비밀번호가 올바르지 않습니다.')
    }
  }

  return (
    <AuthLayout title="로그인">
      <GoogleLoginButton
        onSuccess={() => navigate('/')}
        onError={(message) => setSocialMessage(message)}
      />

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
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'login-email-error' : undefined}
        />
        {errors.email && (
          <p id="login-email-error" className="auth-error-message">
            {errors.email}
          </p>
        )}

        <label className="auth-field-label" htmlFor="login-password">
          비밀번호
        </label>
        <PasswordInput
          id="login-password"
          name="password"
          label="비밀번호"
          value={formState.password}
          onChange={handleTextInputChange('password')}
          autoComplete="current-password"
          invalid={Boolean(errors.password)}
          describedBy={errors.password ? 'login-password-error' : undefined}
        />
        {errors.password && (
          <p id="login-password-error" className="auth-error-message">
            {errors.password}
          </p>
        )}

        {/* '로그인 상태 유지'는 실제로 아무 일도 하지 않아서 뺐다. 로그인은 쿠키로 48시간 유지된다. */}
        <div className="auth-meta-row">
          <Link to="/forgot-password" className="auth-text-button">
            비밀번호 찾기
          </Link>
        </div>

        <button type="submit" className="auth-primary-button">
          로그인
        </button>
      </form>

      {/* 빈 상태로도 늘 자리를 둬야 스크린리더가 나중에 들어온 실패 안내를 읽는다 */}
      <div role="alert">
        {(submitMessage || socialMessage) && (
          <p className="auth-feedback-message">{submitMessage || socialMessage}</p>
        )}
      </div>

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

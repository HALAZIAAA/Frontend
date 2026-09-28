import { Link } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout'
import '../styles/navbar.css'
import '../styles/auth.css'

function ForgotPasswordPage() {
  return (
    <AuthLayout title="비밀번호 찾기">
      <p className="auth-feedback-message">
        준비 중인 기능입니다.
        <br />
        비밀번호를 잊으셨다면 관리자에게 문의해주세요.
      </p>

      <p className="auth-switch-text">
        <Link to="/login" className="auth-switch-link">
          로그인으로 돌아가기
        </Link>
      </p>
    </AuthLayout>
  )
}

export default ForgotPasswordPage

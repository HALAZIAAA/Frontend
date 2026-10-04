import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { useAuth } from '../lib/auth'
import '../styles/navbar.css'
import '../styles/mypage.css'
import { useDocumentTitle } from '../lib/useDocumentTitle'

function ChangePasswordPage() {
  useDocumentTitle('비밀번호 변경')
  const { user, loading, changePassword } = useAuth()
  const navigate = useNavigate()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [saving, setSaving] = useState(false)

  // 세션 복원 중에는 판단을 미룬다.
  if (loading) {
    return null
  }

  // 로그인 안 했거나, 구글로만 가입해 비밀번호가 없는 계정
  if (!user || !user.provider.includes('local')) {
    return (
      <div className="mypage-page">
        <Navbar menuItems={['파일 변환', '커뮤니티', '마이페이지']} />

        <main className="page-container mypage-main">
          <h1 className="mypage-title">비밀번호 변경</h1>

          <section className="mypage-card mypage-guard" aria-label="안내">
            <p className="mypage-guard-message">
              {user
                ? '구글로 가입한 계정은 비밀번호가 없습니다.'
                : '로그인이 필요한 서비스입니다.'}
            </p>
            <Link to={user ? '/mypage' : '/login'} className="mypage-guard-button">
              {user ? '마이페이지로' : '로그인'}
            </Link>
          </section>
        </main>
      </div>
    )
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setMessage('')

    if (next !== confirm) {
      setIsError(true)
      setMessage('새 비밀번호가 서로 다릅니다.')
      return
    }

    setSaving(true)
    const result = await changePassword(current, next)
    setSaving(false)

    if (result.ok) {
      alert('비밀번호가 변경되었습니다. 다른 기기는 로그아웃됩니다.')
      navigate('/mypage')
    } else {
      setIsError(true)
      setMessage(result.error ?? '비밀번호 변경에 실패했습니다.')
    }
  }

  return (
    <div className="mypage-page">
      <Navbar menuItems={['파일 변환', '커뮤니티', '마이페이지']} />

      <main className="page-container mypage-main">
        <Link to="/mypage" className="mypage-back-link">
          ← 마이페이지
        </Link>

        <h1 className="mypage-title">비밀번호 변경</h1>

        <section className="mypage-card" aria-label="비밀번호 변경">
          <p className="mypage-section-hint">
            8자 이상으로 정해주세요. 바꾸면 이 기기만 남고 다른 기기는 로그아웃됩니다.
          </p>

          <form className="mypage-form column" onSubmit={handleSubmit} noValidate>
            <input
              type="password"
              className="mypage-input"
              value={current}
              onChange={(event) => setCurrent(event.target.value)}
              placeholder="현재 비밀번호"
              autoComplete="current-password"
              aria-label="현재 비밀번호"
            />
            <input
              type="password"
              className="mypage-input"
              value={next}
              onChange={(event) => setNext(event.target.value)}
              placeholder="새 비밀번호"
              autoComplete="new-password"
              aria-label="새 비밀번호"
            />
            <input
              type="password"
              className="mypage-input"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              placeholder="새 비밀번호 확인"
              autoComplete="new-password"
              aria-label="새 비밀번호 확인"
            />

            <div className="mypage-danger-actions">
              <Link to="/mypage" className="mypage-save-button ghost">
                취소
              </Link>
              <button type="submit" className="mypage-save-button" disabled={saving}>
                {saving ? '변경 중...' : '비밀번호 변경'}
              </button>
            </div>
          </form>

          <div role="alert">
            {message && (
              <p id="password-message" className={isError ? 'mypage-message error' : 'mypage-message'}>
                {message}
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default ChangePasswordPage

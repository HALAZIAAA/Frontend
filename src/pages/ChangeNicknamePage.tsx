import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { useAuth } from '../lib/auth'
import '../styles/navbar.css'
import '../styles/mypage.css'
import { useDocumentTitle } from '../lib/useDocumentTitle'

function ChangeNicknamePage() {
  useDocumentTitle('닉네임 변경')
  const { user, loading, updateNickname } = useAuth()
  const navigate = useNavigate()
  const [nickname, setNickname] = useState('')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [saving, setSaving] = useState(false)

  // 세션 복원 중에는 판단을 미룬다.
  if (loading) {
    return null
  }

  if (!user) {
    return (
      <div className="mypage-page">
        <Navbar menuItems={['파일 변환', '커뮤니티', '마이페이지']} />

        <main className="page-container mypage-main">
          <h1 className="mypage-title">닉네임 변경</h1>

          <section className="mypage-card mypage-guard" aria-label="로그인 안내">
            <p className="mypage-guard-message">로그인이 필요한 서비스입니다.</p>
            <Link to="/login" className="mypage-guard-button">
              로그인
            </Link>
          </section>
        </main>
      </div>
    )
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setMessage('')

    const nextNickname = nickname.trim()
    if (!nextNickname) {
      setIsError(true)
      setMessage('닉네임을 입력해주세요.')
      return
    }
    if (nextNickname === user.nickname) {
      setIsError(true)
      setMessage('현재 닉네임과 같습니다.')
      return
    }

    setSaving(true)
    const result = await updateNickname(nextNickname)
    setSaving(false)

    if (result.ok) {
      alert('닉네임이 변경되었습니다.')
      navigate('/mypage')
    } else {
      setIsError(true)
      setMessage(result.error ?? '닉네임 변경에 실패했습니다.')
    }
  }

  return (
    <div className="mypage-page">
      <Navbar menuItems={['파일 변환', '커뮤니티', '마이페이지']} />

      <main className="page-container mypage-main">
        <Link to="/mypage" className="mypage-back-link">
          ← 마이페이지
        </Link>

        <h1 className="mypage-title">닉네임 변경</h1>

        <section className="mypage-card" aria-label="닉네임 변경">
          <p className="mypage-section-hint">
            2~12자의 한글, 영문, 숫자, _를 쓸 수 있어요. 커뮤니티에 이 이름이 보입니다.
            <br />
            지금 닉네임은 <strong>{user.nickname}</strong>입니다.
          </p>

          <form className="mypage-form column" onSubmit={handleSubmit} noValidate>
            <input
              id="mypage-nickname"
              name="nickname"
              type="text"
              className="mypage-input"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="새 닉네임"
              maxLength={12}
              aria-label="새 닉네임"
              aria-invalid={isError}
              aria-describedby={message ? 'nickname-message' : undefined}
            />

            <div className="mypage-danger-actions">
              <Link to="/mypage" className="mypage-save-button ghost">
                취소
              </Link>
              <button type="submit" className="mypage-save-button" disabled={saving}>
                {saving ? '저장 중...' : '닉네임 변경'}
              </button>
            </div>
          </form>

          <div role="alert">
            {message && (
              <p id="nickname-message" className={isError ? 'mypage-message error' : 'mypage-message'}>
                {message}
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default ChangeNicknamePage

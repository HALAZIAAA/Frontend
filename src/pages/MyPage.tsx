import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { useAuth } from '../lib/auth'
import '../styles/navbar.css'
import '../styles/mypage.css'

// 가입 경로를 화면에 보여줄 말로 바꾼다. ("local,google" 병합 계정도 있음)
function describeProvider(provider: string): string {
  const hasLocal = provider.includes('local')
  const hasGoogle = provider.includes('google')
  if (hasLocal && hasGoogle) return '이메일 + 구글'
  if (hasGoogle) return '구글'
  return '이메일'
}

function MyPage() {
  const { user, loading, updateNickname } = useAuth()
  const [nickname, setNickname] = useState('')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [saving, setSaving] = useState(false)

  // 세션 복원 중에는 아무것도 그리지 않는다. 여기서 바로 판단하면 새로고침 때 로그인으로 튕긴다.
  if (loading) {
    return null
  }

  // 로그인 페이지로 바로 튕기지 않고, 무엇이 필요한지 알려주고 직접 고르게 한다.
  if (!user) {
    return (
      <div className="mypage-page">
        <Navbar menuItems={['파일 변환', '커뮤니티', '마이페이지']} />

        <main className="mypage-main">
          <h1 className="mypage-title">마이페이지</h1>

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
      setIsError(false)
      setMessage('닉네임이 변경되었습니다.')
      setNickname('')
    } else {
      setIsError(true)
      setMessage(result.error ?? '닉네임 변경에 실패했습니다.')
    }
  }

  return (
    <div className="mypage-page">
      <Navbar menuItems={['파일 변환', '커뮤니티', '마이페이지']} />

      <main className="mypage-main">
        <h1 className="mypage-title">마이페이지</h1>

        <section className="mypage-card" aria-label="내 정보">
          <h2 className="mypage-section-title">내 정보</h2>

          <dl className="mypage-info-list">
            <div className="mypage-info-row">
              <dt>닉네임</dt>
              <dd>
                {user.nickname}
                {user.role === 'admin' && <span className="mypage-admin-badge">관리자</span>}
              </dd>
            </div>
            <div className="mypage-info-row">
              <dt>이메일</dt>
              <dd>{user.email}</dd>
            </div>
            <div className="mypage-info-row">
              <dt>가입 경로</dt>
              <dd>{describeProvider(user.provider)}</dd>
            </div>
          </dl>
        </section>

        <section className="mypage-card" aria-label="닉네임 변경">
          <h2 className="mypage-section-title">닉네임 변경</h2>
          <p className="mypage-section-hint">
            2~12자의 한글, 영문, 숫자, _를 쓸 수 있어요. 커뮤니티에 이 이름이 보입니다.
          </p>

          <form className="mypage-form" onSubmit={handleSubmit} noValidate>
            <input
              id="mypage-nickname"
              name="nickname"
              type="text"
              className="mypage-input"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              placeholder={user.nickname}
              maxLength={12}
              aria-label="새 닉네임"
              aria-invalid={isError}
            />
            <button type="submit" className="mypage-save-button" disabled={saving}>
              {saving ? '저장 중...' : '저장'}
            </button>
          </form>

          {message && (
            <p className={isError ? 'mypage-message error' : 'mypage-message'}>{message}</p>
          )}
        </section>
      </main>
    </div>
  )
}

export default MyPage

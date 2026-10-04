import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import MyPostsSection from '../components/mypage/MyPostsSection'
import MyCommentsSection from '../components/mypage/MyCommentsSection'
import MyFilesSection from '../components/mypage/MyFilesSection'
import DeleteAccountSection from '../components/mypage/DeleteAccountSection'
import { useAuth } from '../lib/auth'
import '../styles/navbar.css'
import '../styles/mypage.css'
import { useDocumentTitle } from '../lib/useDocumentTitle'

// 가입 경로를 화면에 보여줄 말로 바꾼다. ("local,google" 병합 계정도 있음)
function describeProvider(provider: string): string {
  const hasLocal = provider.includes('local')
  const hasGoogle = provider.includes('google')
  if (hasLocal && hasGoogle) return '이메일 + 구글'
  if (hasGoogle) return '구글'
  return '이메일'
}

function MyPage() {
  useDocumentTitle('마이페이지')
  const { user, loading } = useAuth()

  // 세션 복원 중에는 아무것도 그리지 않는다. 여기서 바로 판단하면 새로고침 때 로그인으로 튕긴다.
  if (loading) {
    return null
  }

  // 로그인 페이지로 바로 튕기지 않고, 무엇이 필요한지 알려주고 직접 고르게 한다.
  if (!user) {
    return (
      <div className="mypage-page">
        <Navbar menuItems={['파일 변환', '커뮤니티', '마이페이지']} />

        <main className="page-container mypage-main">
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

  return (
    <div className="mypage-page">
      <Navbar menuItems={['파일 변환', '커뮤니티', '마이페이지']} />

      <main className="page-container mypage-main">
        <h1 className="mypage-title">마이페이지</h1>

        <section className="mypage-card" aria-label="내 정보">
          <h2 className="mypage-section-title">내 정보</h2>

          <dl className="mypage-info-list">
            <div className="mypage-info-row">
              <dt>닉네임</dt>
              <dd>
                {user.nickname}
                {user.role === 'admin' && <span className="mypage-admin-badge">관리자</span>}
                <Link to="/mypage/nickname" className="mypage-inline-link">
                  변경
                </Link>
              </dd>
            </div>
            <div className="mypage-info-row">
              <dt>이메일</dt>
              <dd>
                {user.email}
                {/* 구글로만 가입한 계정은 비밀번호가 없다 */}
                {user.provider.includes('local') && (
                  <Link to="/mypage/password" className="mypage-inline-link">
                    비밀번호 변경
                  </Link>
                )}
              </dd>
            </div>
            <div className="mypage-info-row">
              <dt>가입 경로</dt>
              <dd>{describeProvider(user.provider)}</dd>
            </div>
          </dl>
        </section>

        <MyPostsSection />
        <MyCommentsSection />
        <MyFilesSection />

        <DeleteAccountSection />
      </main>
    </div>
  )
}

export default MyPage

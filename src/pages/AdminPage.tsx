import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import AdminUsersTab from '../components/admin/AdminUsersTab'
import AdminPostsTab from '../components/admin/AdminPostsTab'
import AdminReportsTab from '../components/admin/AdminReportsTab'
import { useAuth } from '../lib/auth'
import '../styles/navbar.css'
import '../styles/mypage.css'
import '../styles/admin.css'

type TabKey = 'users' | 'posts' | 'reports'

function AdminPage() {
  const { user, loading } = useAuth()
  const [tab, setTab] = useState<TabKey>('users')

  // 세션 복원 중에는 판단을 미룬다.
  if (loading) {
    return null
  }

  // 마이페이지와 같은 방식으로, 튕기지 않고 무엇이 필요한지 알려준다.
  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-page">
        <Navbar menuItems={['파일 변환', '커뮤니티', '마이페이지']} />

        <main className="admin-main">
          <h1 className="admin-title">관리자</h1>

          <section className="mypage-card mypage-guard" aria-label="접근 안내">
            <p className="mypage-guard-message">
              {user ? '관리자만 이용할 수 있는 페이지입니다.' : '로그인이 필요한 서비스입니다.'}
            </p>
            <Link to={user ? '/' : '/login'} className="mypage-guard-button">
              {user ? '홈으로' : '로그인'}
            </Link>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <Navbar menuItems={['파일 변환', '커뮤니티', '마이페이지', '관리자']} />

      <main className="admin-main">
        <h1 className="admin-title">관리자</h1>

        <div className="admin-tabs" role="tablist" aria-label="관리 대상 선택">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'users'}
            className={tab === 'users' ? 'admin-tab active' : 'admin-tab'}
            onClick={() => setTab('users')}
          >
            사용자
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'posts'}
            className={tab === 'posts' ? 'admin-tab active' : 'admin-tab'}
            onClick={() => setTab('posts')}
          >
            게시글
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'reports'}
            className={tab === 'reports' ? 'admin-tab active' : 'admin-tab'}
            onClick={() => setTab('reports')}
          >
            신고
          </button>
        </div>

        <section className="admin-card">
          {tab === 'users' && <AdminUsersTab myId={user.id} />}
          {tab === 'posts' && <AdminPostsTab />}
          {tab === 'reports' && <AdminReportsTab />}
        </section>
      </main>
    </div>
  )
}

export default AdminPage

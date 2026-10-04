import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import AdminUsersTab from '../components/admin/AdminUsersTab'
import AdminPostsTab from '../components/admin/AdminPostsTab'
import AdminReportsTab from '../components/admin/AdminReportsTab'
import { useAuth } from '../lib/auth'
import { useTabs } from '../lib/useTabs'
import '../styles/navbar.css'
import '../styles/mypage.css'
import '../styles/admin.css'
import { useDocumentTitle } from '../lib/useDocumentTitle'

type TabKey = 'users' | 'posts' | 'reports'

const TABS: TabKey[] = ['users', 'posts', 'reports']
const TAB_LABELS: Record<TabKey, string> = {
  users: '사용자',
  posts: '게시글',
  reports: '신고',
}

function AdminPage() {
  useDocumentTitle('관리자')
  const { user, loading } = useAuth()
  const [tab, setTab] = useState<TabKey>('users')
  // 훅이라서 아래의 이른 return보다 먼저 불러야 한다.
  const { getTabProps, panelProps } = useTabs({
    idPrefix: 'admin',
    tabs: TABS,
    selected: tab,
    onSelect: setTab,
  })

  // 세션 복원 중에는 판단을 미룬다.
  if (loading) {
    return null
  }

  // 마이페이지와 같은 방식으로, 튕기지 않고 무엇이 필요한지 알려준다.
  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-page">
        <Navbar menuItems={['파일 변환', '커뮤니티', '마이페이지']} />

        <main className="page-container admin-main">
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

      <main className="page-container admin-main">
        <h1 className="admin-title">관리자</h1>

        <div className="admin-tabs" role="tablist" aria-label="관리 대상 선택">
          {TABS.map((key, index) => (
            <button
              key={key}
              type="button"
              className={tab === key ? 'admin-tab active' : 'admin-tab'}
              {...getTabProps(key, index)}
            >
              {TAB_LABELS[key]}
            </button>
          ))}
        </div>

        <section className="admin-card" {...panelProps}>
          {tab === 'users' && <AdminUsersTab myId={user.id} />}
          {tab === 'posts' && <AdminPostsTab />}
          {tab === 'reports' && <AdminReportsTab />}
        </section>
      </main>
    </div>
  )
}

export default AdminPage

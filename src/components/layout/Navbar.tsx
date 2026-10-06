import type { MouseEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import BridgeOnLogo from '../../assets/BridgeOnLogo.png'
import NotificationBell from './NotificationBell'
import DisplaySettingsMenu from './DisplaySettingsMenu'
import { useAuth } from '../../lib/auth'

// 메뉴 이름과 이동할 경로. 모든 화면이 같은 메뉴를 쓴다.
const MENU_ITEMS: Array<{ label: string; path: string }> = [
  { label: '파일 변환', path: '/' },
  { label: '커뮤니티', path: '/community' },
  { label: '채용공고', path: '/jobs' },
  { label: '마이페이지', path: '/mypage' },
]
const ADMIN_MENU_ITEM = { label: '관리자', path: '/admin' }

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // 지금 보고 있는 메뉴. 그 메뉴 자체면 'page', 하위 화면(글 상세 등)이면 'true'로 알린다.
  const currentOf = (path: string): 'page' | 'true' | undefined => {
    if (pathname === path) return 'page'
    if (path !== '/' && pathname.startsWith(`${path}/`)) return 'true'
    return undefined
  }

  // 관리자에게는 어느 화면에서든 관리자 메뉴를 붙여준다.
  const visibleMenuItems = user?.role === 'admin' ? [...MENU_ITEMS, ADMIN_MENU_ITEM] : MENU_ITEMS

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // 본문 바로가기: 화면마다 하나씩 있는 <main>으로 포커스를 옮겨서 다음 Tab이 메뉴를 건너뛰고 본문부터 시작하게 한다.
  const handleSkipToMain = (event: MouseEvent<HTMLAnchorElement>) => {
    const main = document.querySelector('main')
    if (!main) return
    event.preventDefault()
    main.setAttribute('tabindex', '-1')
    main.focus()
  }

  return (
    <header className="navbar-wrapper">
      <a href="#main" className="skip-link" onClick={handleSkipToMain}>
        본문 바로가기
      </a>
      <nav className="page-container navbar-container" aria-label="주요 메뉴">
        <div className="navbar-logo-area">
          <Link className="navbar-logo-link" to="/" aria-label="BridgeOn 홈으로 이동">
            <img src={BridgeOnLogo} alt="BridgeOn 로고" className="navbar-logo-image" />
            <span className="navbar-logo-text">BridgeOn</span>
          </Link>
        </div>

        <ul className="navbar-menu-list">
          {visibleMenuItems.map(({ label, path }) => (
            <li key={label} className="navbar-menu-item">
              <Link
                to={path}
                className="navbar-menu-button"
                aria-label={`${label} 페이지로 이동`}
                aria-current={currentOf(path)}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <DisplaySettingsMenu />

        <div className="navbar-action-area">
          {user ? (
            <>
              <NotificationBell />
              <Link to="/mypage" className="navbar-user-name" aria-label="마이페이지로 이동">
                {user.nickname}
              </Link>
              <button type="button" className="navbar-logout-button" onClick={handleLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <Link to="/login" className="navbar-login-button" aria-label="로그인 페이지로 이동">
              로그인
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Navbar

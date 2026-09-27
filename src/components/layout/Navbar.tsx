import { Link, useNavigate } from 'react-router-dom'
import BridgeOnLogo from '../../assets/BridgeOnLogo.png'
import { useAuth } from '../../lib/auth'

type NavbarProps = {
  menuItems: string[]
}

// 메뉴 이름과 이동할 경로. 여기에 없는 이름은 링크 없는 버튼으로 남는다.
const MENU_PATHS: Record<string, string> = {
  '파일 변환': '/',
  '커뮤니티': '/community',
  '마이페이지': '/mypage',
}

function Navbar({ menuItems }: NavbarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="navbar-wrapper">
      <nav className="navbar-container" aria-label="주요 메뉴">
        <div className="navbar-logo-area">
          <Link className="navbar-logo-link" to="/" aria-label="BridgeOn 홈으로 이동">
            <img src={BridgeOnLogo} alt="BridgeOn 로고" className="navbar-logo-image" />
            <span className="navbar-logo-text">BridgeOn</span>
          </Link>
        </div>

        <ul className="navbar-menu-list">
          {menuItems.map((item) => {
            const path = MENU_PATHS[item]

            return (
              <li key={item} className="navbar-menu-item">
                {path ? (
                  <Link to={path} className="navbar-menu-button" aria-label={`${item} 페이지로 이동`}>
                    {item}
                  </Link>
                ) : (
                  <button type="button" className="navbar-menu-button">
                    {item}
                  </button>
                )}
              </li>
            )
          })}
        </ul>

        <div className="navbar-action-area">
          {user ? (
            <>
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

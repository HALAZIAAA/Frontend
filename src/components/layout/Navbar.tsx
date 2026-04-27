import { Link } from 'react-router-dom'

type NavbarProps = {
  menuItems: string[]
  loginLabel?: string
}

function Navbar({ menuItems, loginLabel = '로그인' }: NavbarProps) {
  return (
    <header className="navbar-wrapper">
      <nav className="navbar-container" aria-label="주요 메뉴">
        <div className="navbar-logo-area">
          <Link className="navbar-logo-link" to="/" aria-label="FileConverter 홈으로 이동">
            <span className="navbar-logo-mark" aria-hidden="true">
              FC
            </span>
            <span className="navbar-logo-text">FileConverter</span>
          </Link>
        </div>

        <ul className="navbar-menu-list">
          {menuItems.map((item) => (
            <li key={item} className="navbar-menu-item">
              {item === '파일 변환' ? (
                <Link to="/" className="navbar-menu-button" aria-label="파일 변환 페이지로 이동">
                  {item}
                </Link>
              ) : (
                <button type="button" className="navbar-menu-button">
                  {item}
                </button>
              )}
            </li>
          ))}
        </ul>

        <div className="navbar-action-area">
          <Link to="/login" className="navbar-login-button" aria-label="로그인 페이지로 이동">
            {loginLabel}
          </Link>
        </div>
      </nav>
    </header>
  )
}

export default Navbar

type NavbarProps = {
  menuItems: string[]
  loginLabel?: string
}

function Navbar({ menuItems, loginLabel = '로그인' }: NavbarProps) {
  return (
    <header className="navbar-wrapper">
      <nav className="navbar-container" aria-label="주요 메뉴">
        <div className="navbar-logo-area">
          <a className="navbar-logo-link" href="#" aria-label="FileConverter 홈으로 이동">
            <span className="navbar-logo-mark" aria-hidden="true">
              FC
            </span>
            <span className="navbar-logo-text">FileConverter</span>
          </a>
        </div>

        <ul className="navbar-menu-list">
          {menuItems.map((item) => (
            <li key={item} className="navbar-menu-item">
              <button type="button" className="navbar-menu-button">
                {item}
              </button>
            </li>
          ))}
        </ul>

        <div className="navbar-action-area">
          <button type="button" className="navbar-login-button">
            {loginLabel}
          </button>
        </div>
      </nav>
    </header>
  )
}

export default Navbar

import type { ReactNode } from 'react'
import Navbar from '../layout/Navbar'

type AuthLayoutProps = {
  title: string
  children: ReactNode
}

function AuthLayout({ title, children }: AuthLayoutProps) {
  return (
    <div className="homepage-wrapper">
      <Navbar menuItems={['파일 변환', '커뮤니티']} />
      <main className="auth-page-main" aria-labelledby="auth-page-title">
        <section className="auth-card">
          <h1 id="auth-page-title" className="auth-card-title">
            {title}
          </h1>
          {children}
        </section>
      </main>
    </div>
  )
}

export default AuthLayout

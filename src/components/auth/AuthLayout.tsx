import type { ReactNode } from 'react'
import Navbar from '../layout/Navbar'

type AuthLayoutProps = {
  title: string
  children: ReactNode
}

function AuthLayout({ title, children }: AuthLayoutProps) {
  return (
    <div className="homepage-wrapper">
      <Navbar />
      <main className="page-container auth-page-main" aria-labelledby="auth-page-title">
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

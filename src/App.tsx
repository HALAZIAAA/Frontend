import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import MyPage from './pages/MyPage'
import AdminPage from './pages/AdminPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import ChangeNicknamePage from './pages/ChangeNicknamePage'
import CommunityPage from './pages/community/CommunityPage'
import JobsPage from './pages/JobsPage'
import PostDetailPage from './pages/community/PostDetailPage'
import PostEditPage from './pages/community/PostEditPage'
import PostWritePage from './pages/community/PostWritePage'
import { Navigate, Route, Routes } from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/mypage" element={<MyPage />} />
      <Route path="/mypage/nickname" element={<ChangeNicknamePage />} />
      <Route path="/mypage/password" element={<ChangePasswordPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/community" element={<CommunityPage />} />
      <Route path="/community/write" element={<PostWritePage />} />
      <Route path="/community/:id/edit" element={<PostEditPage />} />
      <Route path="/community/:id" element={<PostDetailPage />} />
      <Route path="/jobs" element={<JobsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

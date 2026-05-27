import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import CommunityPage from './pages/community/CommunityPage'
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
      <Route path="/community" element={<CommunityPage />} />
      <Route path="/community/write" element={<PostWritePage />} />
      <Route path="/community/:id/edit" element={<PostEditPage />} />
      <Route path="/community/:id" element={<PostDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

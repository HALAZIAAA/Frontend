import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar'
import { createPost } from '../../api/communityApi'
import { useAuth } from '../../lib/auth'
import type { PostCategory } from '../../types/community'
import '../../styles/community-write.css'

function PostWritePage() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<PostCategory>('질문')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 세션 복원 중에는 판단을 미룬다. (새로고침 때 로그인으로 튕기는 것 방지)
  if (loading) {
    return null
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const handleCancel = () => {
    navigate('/community')
  }

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.')
      return
    }

    setSubmitting(true)
    try {
      const created = await createPost({
        title: title.trim(),
        category,
        content: content.trim(),
      })
      navigate(`/community/${created.id}`)
    } catch (error) {
      alert(error instanceof Error ? error.message : '글 등록에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="write-page">
      <Navbar menuItems={['파일 변환', '커뮤니티']} />

      <main className="write-main">
        <Link to="/community" className="write-back-link">
          ← 목록으로
        </Link>

        <section className="write-card" aria-label="게시글 작성 폼">
          <h1 className="write-title">글쓰기</h1>

          <div className="write-form">
            <div className="form-field">
              <label className="form-label" htmlFor="post-title">
                제목
              </label>
              <input
                id="post-title"
                className="form-input"
                type="text"
                value={title}
                placeholder="제목을 입력하세요"
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="post-category">
                주제 선택
              </label>
              <select
                id="post-category"
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as PostCategory)}
              >
                {/* 공지는 관리자만 쓸 수 있어서 그 외에는 아예 보여주지 않는다. */}
                {user.role === 'admin' && <option value="공지">공지</option>}
                <option value="질문">질문</option>
                <option value="팁">팁</option>
                <option value="후기">후기</option>
              </select>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="post-content">
                내용
              </label>
              <textarea
                id="post-content"
                className="form-textarea"
                value={content}
                placeholder="내용을 입력하세요"
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <div className="write-actions">
              <button type="button" className="write-cancel-button" onClick={handleCancel}>
                작성 취소
              </button>
              <button
                type="button"
                className="write-submit-button"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? '등록 중...' : '등록'}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default PostWritePage

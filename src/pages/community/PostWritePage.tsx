import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar'
import ImageAttacher from '../../components/community/ImageAttacher'
import { createPost } from '../../api/communityApi'
import { useAuth } from '../../lib/auth'
import { useFeedback } from '../../lib/feedback'
import type { PostCategory, PostImage } from '../../types/community'
import '../../styles/community-write.css'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { ArrowLeftIcon } from '@phosphor-icons/react'

function PostWritePage() {
  useDocumentTitle('글쓰기')
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const { toast } = useFeedback()
  // 빈 칸 안내는 그 칸 바로 아래에 보여 주고, 입력칸과 이어서 스크린리더가 함께 읽게 한다.
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({})

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<PostCategory>('질문')
  const [content, setContent] = useState('')
  const [images, setImages] = useState<PostImage[]>([])
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
    const nextErrors = {
      title: title.trim() ? undefined : '제목을 입력해주세요.',
      content: content.trim() ? undefined : '내용을 입력해주세요.',
    }
    setErrors(nextErrors)
    if (nextErrors.title || nextErrors.content) {
      document.getElementById(nextErrors.title ? 'post-title' : 'post-content')?.focus()
      return
    }

    setSubmitting(true)
    try {
      const created = await createPost({
        title: title.trim(),
        category,
        content: content.trim(),
        imageIds: images.map((image) => image.id),
      })
      navigate(`/community/${created.id}`)
    } catch (error) {
      toast(error instanceof Error ? error.message : '글 등록에 실패했습니다.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="write-page">
      <Navbar />

      <main className="page-container write-main">
        <Link to="/community" className="write-back-link">
          <ArrowLeftIcon aria-hidden="true" size={18} />
          목록으로
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
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? 'post-title-error' : undefined}
              />
              {errors.title && (
                <p id="post-title-error" className="form-error" role="alert">
                  {errors.title}
                </p>
              )}
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
                aria-invalid={Boolean(errors.content)}
                aria-describedby={errors.content ? 'post-content-error' : undefined}
              />
              {errors.content && (
                <p id="post-content-error" className="form-error" role="alert">
                  {errors.content}
                </p>
              )}
            </div>

            <ImageAttacher images={images} onChange={setImages} />

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

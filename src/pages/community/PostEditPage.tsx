import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar'
import ImageAttacher from '../../components/community/ImageAttacher'
import { getPost, updatePost } from '../../api/communityApi'
import { useAuth } from '../../lib/auth'
import type { PostCategory, PostDetail, PostImage } from '../../types/community'
import '../../styles/community-write.css'

function PostEditPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()

  const postId = Number(id)
  const [post, setPost] = useState<PostDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<PostCategory>('질문')
  const [content, setContent] = useState('')
  const [images, setImages] = useState<PostImage[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    getPost(postId)
      .then((detail) => {
        if (cancelled) return
        setPost(detail)
        setTitle(detail.title)
        setCategory(detail.category)
        setContent(detail.content)
        setImages(detail.images)
      })
      .catch(() => {
        if (!cancelled) setPost(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [postId])

  const handleCancel = () => {
    navigate(-1)
  }

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.')
      return
    }

    setSubmitting(true)
    try {
      await updatePost(postId, {
        title: title.trim(),
        category,
        content: content.trim(),
        imageIds: images.map((image) => image.id),
      })
      navigate(`/community/${postId}`)
    } catch (error) {
      alert(error instanceof Error ? error.message : '수정에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="write-page">
        <Navbar menuItems={['파일 변환', '커뮤니티', '마이페이지']} />
        <main className="write-main">
          <div className="post-detail-not-found">
            <p>불러오는 중...</p>
          </div>
        </main>
      </div>
    )
  }

  // 없는 글이거나 남의 글이면 폼을 아예 보여주지 않는다. (서버도 403으로 막는다)
  if (!post || !post.isMine) {
    return (
      <div className="write-page">
        <Navbar menuItems={['파일 변환', '커뮤니티', '마이페이지']} />
        <main className="write-main">
          <div className="post-detail-not-found">
            <p>{post ? '본인이 작성한 글만 수정할 수 있습니다.' : '존재하지 않는 게시글입니다'}</p>
            <Link to="/community">목록으로</Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="write-page">
      <Navbar menuItems={['파일 변환', '커뮤니티', '마이페이지']} />

      <main className="write-main">
        <Link to={`/community/${postId}`} className="write-back-link">
          ← 게시글로
        </Link>

        <section className="write-card" aria-label="게시글 수정 폼">
          <h1 className="write-title">글 수정</h1>

          <div className="write-form">
            <div className="form-field">
              <label className="form-label" htmlFor="edit-post-title">
                제목
              </label>
              <input
                id="edit-post-title"
                className="form-input"
                type="text"
                value={title}
                placeholder="제목을 입력하세요"
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="edit-post-category">
                주제 선택
              </label>
              <select
                id="edit-post-category"
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as PostCategory)}
              >
                {(user?.role === 'admin' || category === '공지') && (
                  <option value="공지">공지</option>
                )}
                <option value="질문">질문</option>
                <option value="팁">팁</option>
                <option value="후기">후기</option>
              </select>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="edit-post-content">
                내용
              </label>
              <textarea
                id="edit-post-content"
                className="form-textarea"
                value={content}
                placeholder="내용을 입력하세요"
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <ImageAttacher images={images} onChange={setImages} />

            <div className="write-actions">
              <button type="button" className="write-cancel-button" onClick={handleCancel}>
                수정 취소
              </button>
              <button
                type="button"
                className="write-submit-button"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? '수정 중...' : '수정 완료'}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default PostEditPage

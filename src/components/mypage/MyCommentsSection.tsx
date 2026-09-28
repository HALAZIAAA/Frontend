import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyComments } from '../../api/communityApi'
import type { MyComment } from '../../types/community'

const LIMIT = 10

function MyCommentsSection() {
  const [comments, setComments] = useState<MyComment[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    getMyComments(LIMIT)
      .then((result) => {
        if (cancelled) return
        setComments(result.comments)
        setTotal(result.total)
        setError('')
      })
      .catch((err) => {
        if (cancelled) return
        setComments([])
        setError(err instanceof Error ? err.message : '댓글을 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="mypage-card" aria-label="내가 쓴 댓글">
      <h2 className="mypage-section-title">
        내가 쓴 댓글
        {total > 0 && <span className="mypage-section-count">{total}</span>}
      </h2>

      {loading ? (
        <p className="mypage-list-empty">불러오는 중...</p>
      ) : error ? (
        <p className="mypage-list-empty">{error}</p>
      ) : comments.length === 0 ? (
        <p className="mypage-list-empty">아직 작성한 댓글이 없습니다.</p>
      ) : (
        <>
          <ul className="mypage-list">
            {comments.map((comment) => (
              <li key={comment.id} className="mypage-list-item">
                <Link to={`/community/${comment.postId}`} className="mypage-list-main">
                  <span className="mypage-list-title">{comment.content}</span>
                </Link>
                <span className="mypage-list-sub">
                  {comment.postTitle} · {comment.createdAt} · 👍 {comment.likes}
                </span>
              </li>
            ))}
          </ul>

          {total > comments.length && (
            <p className="mypage-list-more">최근 {LIMIT}개만 표시됩니다.</p>
          )}
        </>
      )}
    </section>
  )
}

export default MyCommentsSection

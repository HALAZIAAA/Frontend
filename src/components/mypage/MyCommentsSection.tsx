import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyComments } from '../../api/communityApi'
import type { MyComment } from '../../types/community'
import { ThumbsUpIcon } from '@phosphor-icons/react'
import { SkeletonList } from '../common/Skeleton'
import EmptyState from '../common/EmptyState'
import { ChatCircleDotsIcon } from '@phosphor-icons/react'

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
        <SkeletonList count={2} lines={2} label="내가 쓴 댓글을 불러오는 중" />
      ) : error ? (
        <p className="mypage-list-empty">{error}</p>
      ) : comments.length === 0 ? (
        <EmptyState
          icon={<ChatCircleDotsIcon size={28} />}
          title="아직 쓴 댓글이 없어요"
          description="커뮤니티 글에 의견을 남겨 보세요."
          action={
            <Link to="/community" className="empty-state-button">
              커뮤니티 둘러보기
            </Link>
          }
        />
      ) : (
        <>
          <ul className="mypage-list">
            {comments.map((comment) => (
              <li key={comment.id} className="mypage-list-item">
                <Link to={`/community/${comment.postId}`} className="mypage-list-main">
                  <span className="mypage-list-title">{comment.content}</span>
                </Link>
                <span className="mypage-list-sub">
                  {comment.postTitle} · {comment.createdAt}
                  <span className="icon-stat">
                    <ThumbsUpIcon aria-hidden="true" size={16} />
                    <span className="sr-only">좋아요 </span>
                    {comment.likes}
                  </span>
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

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Pagination from '../community/Pagination'
import { getPosts } from '../../api/communityApi'
import type { PostSummary } from '../../types/community'
import { ChatCircleIcon, EyeIcon, ThumbsUpIcon } from '@phosphor-icons/react'
import { SkeletonList } from '../common/Skeleton'
import EmptyState from '../common/EmptyState'
import { NotePencilIcon } from '@phosphor-icons/react'

function MyPostsSection() {
  const [posts, setPosts] = useState<PostSummary[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    getPosts({ author: 'me', page })
      .then((result) => {
        if (cancelled) return
        setPosts(result.posts)
        setTotalPages(result.totalPages)
        setPage(result.currentPage)
        setError('')
      })
      .catch((err) => {
        if (cancelled) return
        setPosts([])
        setError(err instanceof Error ? err.message : '글을 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [page])

  return (
    <section className="mypage-card" aria-label="내가 쓴 글">
      <h2 className="mypage-section-title">내가 쓴 글</h2>

      {loading ? (
        <SkeletonList count={2} lines={2} label="내가 쓴 글을 불러오는 중" />
      ) : error ? (
        <p className="mypage-list-empty">{error}</p>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={<NotePencilIcon size={28} />}
          title="아직 쓴 글이 없어요"
          description="궁금한 점이나 쓸모 있던 팁을 나눠 보세요."
          action={
            <Link to="/community/write" className="empty-state-button">
              글쓰기
            </Link>
          }
        />
      ) : (
        <>
          <ul className="mypage-list">
            {posts.map((post) => (
              <li key={post.id} className="mypage-list-item">
                <Link to={`/community/${post.id}`} className="mypage-list-main">
                  <span className="mypage-list-tag">{post.category}</span>
                  <span className="mypage-list-title">{post.title}</span>
                </Link>
                <span className="mypage-list-sub">
                  {post.createdAt}
                  <span className="icon-stat">
                    <EyeIcon aria-hidden="true" size={16} />
                    <span className="sr-only">조회 </span>
                    {post.views}
                  </span>
                  <span className="icon-stat">
                    <ThumbsUpIcon aria-hidden="true" size={16} />
                    <span className="sr-only">좋아요 </span>
                    {post.likes}
                  </span>
                  <span className="icon-stat">
                    <ChatCircleIcon aria-hidden="true" size={16} />
                    <span className="sr-only">댓글 </span>
                    {post.commentCount}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </section>
  )
}

export default MyPostsSection

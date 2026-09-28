import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Pagination from '../community/Pagination'
import { getPosts } from '../../api/communityApi'
import type { PostSummary } from '../../types/community'

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
        <p className="mypage-list-empty">불러오는 중...</p>
      ) : error ? (
        <p className="mypage-list-empty">{error}</p>
      ) : posts.length === 0 ? (
        <p className="mypage-list-empty">아직 작성한 글이 없습니다.</p>
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
                  {post.createdAt} · 👁 {post.views} · 👍 {post.likes} · 💬 {post.commentCount}
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

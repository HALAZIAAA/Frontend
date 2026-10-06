import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Pagination from '../community/Pagination'
import { getAdminPosts } from '../../api/adminApi'
import { deletePost } from '../../api/communityApi'
import type { AdminPost } from '../../types/admin'
import { useFeedback } from '../../lib/feedback'
import { ChatCircleIcon, EyeIcon } from '@phosphor-icons/react'
import { SkeletonList } from '../common/Skeleton'

function AdminPostsTab() {
  const { toast, confirm } = useFeedback()
  const [keyword, setKeyword] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [posts, setPosts] = useState<AdminPost[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchKeyword(keyword)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [keyword])

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    getAdminPosts(searchKeyword, page)
      .then((result) => {
        if (cancelled) return
        setPosts(result.posts)
        setTotal(result.total)
        setTotalPages(result.totalPages)
        setPage(result.currentPage)
        setError('')
      })
      .catch((err) => {
        if (cancelled) return
        setPosts([])
        setError(err instanceof Error ? err.message : '게시글을 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [searchKeyword, page])

  const handleDelete = async (target: AdminPost) => {
    const ok = await confirm({
      title: `'${target.title}' 글을 삭제할까요?`,
      message: '되돌릴 수 없습니다.',
      confirmLabel: '삭제',
      danger: true,
    })
    if (!ok) return

    setBusyId(target.id)
    try {
      await deletePost(target.id)
      setPosts((prev) => prev.filter((item) => item.id !== target.id))
      setTotal((prev) => Math.max(0, prev - 1))
      toast('글을 삭제했습니다.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : '삭제에 실패했습니다.', 'error')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <div className="admin-toolbar">
        <input
          type="text"
          className="admin-search-input"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="제목, 본문, 작성자 검색..."
          aria-label="게시글 검색"
        />
        <span className="admin-total">전체 {total}개</span>
      </div>

      {loading ? (
        <SkeletonList count={4} lines={2} label="게시글 목록을 불러오는 중" />
      ) : error ? (
        <p className="admin-empty">{error}</p>
      ) : posts.length === 0 ? (
        <p className="admin-empty">조건에 맞는 게시글이 없습니다.</p>
      ) : (
        <>
          <ul className="admin-list">
            {posts.map((post) => (
              <li key={post.id} className="admin-row">
                <div className="admin-row-main">
                  <span className="admin-row-title">
                    <span className="admin-badge category">{post.category}</span>
                    <Link to={`/community/${post.id}`} className="admin-row-link">
                      {post.title}
                    </Link>
                    {!post.authorActive && <span className="admin-badge stopped">숨김</span>}
                  </span>
                  <span className="admin-row-sub">
                    {post.author} · {post.createdAt}
                    <span className="icon-stat">
                      <EyeIcon aria-hidden="true" size={16} />
                      <span className="sr-only">조회 </span>
                      {post.views}
                    </span>
                    <span className="icon-stat">
                      <ChatCircleIcon aria-hidden="true" size={16} />
                      <span className="sr-only">댓글 </span>
                      {post.commentCount}
                    </span>
                  </span>
                </div>

                <div className="admin-row-actions">
                  <button
                    type="button"
                    className="admin-action-button danger"
                    onClick={() => handleDelete(post)}
                    disabled={busyId === post.id}
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </>
  )
}

export default AdminPostsTab

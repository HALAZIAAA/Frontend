import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { likePost } from '../../api/communityApi'
import { useAuth } from '../../lib/auth'
import type { PostSummary } from '../../types/community'

type PostCardProps = {
  post: PostSummary
}

function getCategoryBadgeClass(category: PostSummary['category']): string {
  if (category === '질문') return 'post-card-category-badge question'
  if (category === '팁') return 'post-card-category-badge tip'
  if (category === '공지') return 'post-card-category-badge notice'
  return 'post-card-category-badge review'
}

function PostCard({ post }: PostCardProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [likes, setLikes] = useState(post.likes)
  const [liked, setLiked] = useState(post.likedByMe)

  const handleLikeClick = async () => {
    if (!user) {
      alert('로그인이 필요합니다.')
      navigate('/login')
      return
    }

    try {
      const result = await likePost(post.id)
      setLikes(result.likes)
      setLiked(result.likedByMe)
    } catch (error) {
      alert(error instanceof Error ? error.message : '좋아요에 실패했습니다.')
    }
  }

  return (
    <article className="post-card">
      <div className="post-card-top">
        <span className={getCategoryBadgeClass(post.category)}>{post.category}</span>
      </div>

      <div className="post-card-middle">
        {/* 제목이 진짜 링크라서 Tab → Enter로 열 수 있다.
            카드 어디를 눌러도 열리는 건 CSS(.post-card-link::after)가 누르는 영역을 카드 전체로 넓혀서 처리한다. */}
        <h2 className="post-card-title">
          <Link to={`/community/${post.id}`} className="post-card-link">
            {post.title}
          </Link>
        </h2>
        <p className="post-card-preview">{post.preview}</p>
      </div>

      <div className="post-card-bottom">
        <span className="post-card-meta">
          {post.author} • {post.createdAt}
        </span>
        <span className="post-card-stats">
          <span>👁 {post.views}</span>
          <button
            type="button"
            className={liked ? 'post-card-like-button liked' : 'post-card-like-button'}
            onClick={handleLikeClick}
          >
            👍 좋아요 {likes}
          </button>
          <span>💬 {post.commentCount}</span>
        </span>
      </div>
    </article>
  )
}

export default PostCard

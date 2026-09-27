import { useState, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
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

  const handleClick = () => {
    navigate(`/community/${post.id}`)
  }

  const handleLikeClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()

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
    <article className="post-card" onClick={handleClick}>
      <div className="post-card-top">
        <span className={getCategoryBadgeClass(post.category)}>{post.category}</span>
      </div>

      <div className="post-card-middle">
        <h2 className="post-card-title">{post.title}</h2>
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

import { useState, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { likePost } from '../../api/communityApi'
import type { Post } from '../../types/community'

type PostCardProps = {
  post: Post
}

function getCategoryBadgeClass(category: Post['category']): string {
  if (category === '질문') return 'post-card-category-badge question'
  if (category === '팁') return 'post-card-category-badge tip'
  if (category === '공지') return 'post-card-category-badge notice'
  return 'post-card-category-badge review'
}

function PostCard({ post }: PostCardProps) {
  const navigate = useNavigate()
  const [likes, setLikes] = useState(post.likes)

  const handleClick = () => {
    navigate(`/community/${post.id}`)
  }

  const handleLikeClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    const updated = likePost(post.id)
    if (updated) {
      setLikes(updated.likes)
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
          <button type="button" className="post-card-like-button" onClick={handleLikeClick}>
            👍 좋아요 {likes}
          </button>
          <span>💬 {post.comments.length}</span>
        </span>
      </div>
    </article>
  )
}

export default PostCard


import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { likePost } from '../../api/communityApi'
import { useAuth } from '../../lib/auth'
import { useFeedback } from '../../lib/feedback'
import type { PostSummary } from '../../types/community'
import { ChatCircleIcon, EyeIcon, PushPinIcon, ThumbsUpIcon } from '@phosphor-icons/react'

type PostCardProps = {
  post: PostSummary
}

function PostCard({ post }: PostCardProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useFeedback()
  const [likes, setLikes] = useState(post.likes)
  const [liked, setLiked] = useState(post.likedByMe)

  const handleLikeClick = async () => {
    if (!user) {
      // 로그인 화면으로 옮긴 뒤에도 알림이 남아 왜 옮겨졌는지 알 수 있다.
      navigate('/login')
      toast('좋아요를 누르려면 로그인이 필요합니다.', 'info')
      return
    }

    try {
      const result = await likePost(post.id)
      setLikes(result.likes)
      setLiked(result.likedByMe)
    } catch (error) {
      toast(error instanceof Error ? error.message : '좋아요에 실패했습니다.', 'error')
    }
  }

  return (
    <article className="post-card">
      {/* 분류 칩은 모두 회색으로 두고 공지만 핀 아이콘 + 진한 색으로 구분한다. (색만으로 구분하지 않게 아이콘도 함께) */}
      <div className="post-card-head">
        <span className={post.category === '공지' ? 'post-card-category-badge notice' : 'post-card-category-badge'}>
          {post.category === '공지' && <PushPinIcon aria-hidden="true" size={14} weight="fill" />}
          {post.category}
        </span>
        {/* 제목이 진짜 링크라서 Tab → Enter로 열 수 있다.
            줄 어디를 눌러도 열리는 건 CSS(.post-card-link::after)가 누르는 영역을 줄 전체로 넓혀서 처리한다. */}
        <h2 className="post-card-title">
          <Link to={`/community/${post.id}`} className="post-card-link">
            {post.title}
          </Link>
        </h2>
      </div>
      <p className="post-card-preview">{post.preview}</p>

      <div className="post-card-bottom">
        <span className="post-card-meta">
          {post.author} • {post.createdAt}
        </span>
        <span className="post-card-stats">
          <span className="icon-stat">
            <EyeIcon aria-hidden="true" size={18} />
            <span className="sr-only">조회 </span>
            {post.views}
          </span>
          <button
            type="button"
            className={liked ? 'post-card-like-button liked' : 'post-card-like-button'}
            onClick={handleLikeClick}
          >
            <ThumbsUpIcon aria-hidden="true" size={18} weight={liked ? 'fill' : 'regular'} />
            좋아요 {likes}
          </button>
          <span className="icon-stat">
            <ChatCircleIcon aria-hidden="true" size={18} />
            <span className="sr-only">댓글 </span>
            {post.commentCount}
          </span>
        </span>
      </div>
    </article>
  )
}

export default PostCard

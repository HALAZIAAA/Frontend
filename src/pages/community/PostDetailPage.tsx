import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar'
import { addComment, deletePost, getPost, likeComment, likePost } from '../../api/communityApi'
import { CURRENT_USER } from '../../lib/currentUser'
import type { Comment, Post } from '../../types/community'
import '../../styles/navbar.css'
import '../../styles/community-detail.css'

function getCategoryBadgeClass(category: Post['category']): string {
  if (category === '질문') return 'post-detail-category-badge question'
  if (category === '팁') return 'post-detail-category-badge tip'
  if (category === '공지') return 'post-detail-category-badge notice'
  return 'post-detail-category-badge review'
}

function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const numericId = Number(id)
  const [post, setPost] = useState<Post | null>(null)
  const [newComment, setNewComment] = useState('')
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [replyTargetId, setReplyTargetId] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState('')

  useEffect(() => {
    const initial = getPost(numericId)
    if (initial) {
      setPost(initial)
    }
  }, [numericId])

  const topLevelComments = useMemo(
    () => (post ? post.comments.filter((comment) => comment.parentId === null) : []),
    [post],
  )

  const repliesByParent = useMemo(() => {
    const map = new Map<number, Comment[]>()
    if (!post) return map
    post.comments.forEach((comment) => {
      if (comment.parentId === null) return
      const list = map.get(comment.parentId) ?? []
      list.push(comment)
      map.set(comment.parentId, list)
    })
    return map
  }, [post])

  const handleEdit = () => {
    navigate(`/community/${id}/edit`)
  }

  const handleDelete = () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      deletePost(Number(id))
      navigate('/community')
    }
  }

  const handlePostLike = () => {
    const updated = likePost(numericId)
    if (updated) {
      setPost(updated)
    }
  }

  const handleCommentSubmit = () => {
    if (!newComment.trim()) {
      alert('댓글 내용을 입력해주세요.')
      return
    }
    const updated = addComment({
      postId: numericId,
      content: newComment.trim(),
      author: CURRENT_USER.name,
      parentId: null,
    })
    if (updated) {
      setPost(updated)
      setNewComment('')
      setShowCommentInput(false)
    }
  }

  const handleReplyClick = (commentId: number) => {
    setReplyTargetId(commentId)
    setReplyContent('')
  }

  const handleReplySubmit = () => {
    if (replyTargetId == null) return
    if (!replyContent.trim()) {
      alert('답글 내용을 입력해주세요.')
      return
    }
    const updated = addComment({
      postId: numericId,
      content: replyContent.trim(),
      author: CURRENT_USER.name,
      parentId: replyTargetId,
    })
    if (updated) {
      setPost(updated)
      setReplyContent('')
      setReplyTargetId(null)
    }
  }

  const handleCommentLike = (commentId: number) => {
    const updated = likeComment(numericId, commentId)
    if (updated) {
      setPost(updated)
    }
  }

  if (!post) {
    return (
      <div className="post-detail-page">
        <Navbar menuItems={['파일 변환', '커뮤니티']} />
        <main className="post-detail-main">
          <div className="post-detail-not-found">
            <p>존재하지 않는 게시글입니다.</p>
            <Link to="/community">목록으로</Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="post-detail-page">
      <Navbar menuItems={['파일 변환', '커뮤니티']} />

      <main className="post-detail-main">
        <Link to="/community" className="post-detail-back-link">
          ← 목록으로
        </Link>

        <article className="post-detail-card">
          <div className="post-detail-card-header">
            <span className={getCategoryBadgeClass(post.category)}>{post.category}</span>
            <div className="post-detail-actions">
              <button
                type="button"
                className="post-detail-action-button edit"
                onClick={handleEdit}
              >
                ✏ 수정
              </button>
              <button
                type="button"
                className="post-detail-action-button delete"
                onClick={handleDelete}
              >
                🗑 삭제
              </button>
            </div>
          </div>

          <h2 className="post-detail-title">{post.title}</h2>

          <div className="post-detail-meta">
            <span>{post.author}</span>
            <span>•</span>
            <span>{post.createdAt}</span>
            <span>•</span>
            <span className="post-detail-meta-stats">
              <span>👁 {post.views}</span>
              <span>👍 {post.likes}</span>
              <span>💬 {post.comments.length}</span>
            </span>
          </div>

          <hr className="post-detail-divider" />

          <p className="post-detail-content">{post.content}</p>

          <div className="post-detail-action-bar">
            <button
              type="button"
              className="post-action-button like"
              onClick={handlePostLike}
            >
              👍 좋아요 {post.likes}
            </button>
            <button
              type="button"
              className={`post-action-button comment${showCommentInput ? ' active' : ''}`}
              onClick={() => setShowCommentInput((v) => !v)}
            >
              💬 댓글 작성
            </button>
          </div>

          {showCommentInput && (
            <div className="comment-new-box">
              <textarea
                className="comment-new-textarea"
                placeholder="댓글을 입력하세요"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                autoFocus
              />
              <div className="comment-new-actions">
                <button
                  type="button"
                  className="comment-reply-cancel-button"
                  onClick={() => {
                    setShowCommentInput(false)
                    setNewComment('')
                  }}
                >
                  취소
                </button>
                <button type="button" className="comment-submit-button" onClick={handleCommentSubmit}>
                  댓글 등록
                </button>
              </div>
            </div>
          )}
        </article>

        <section className="comment-section" aria-label="댓글">
          <h3 className="comment-section-title">
            댓글 <span className="comment-count-accent">{post.comments.length}</span>
          </h3>

          {topLevelComments.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>아직 댓글이 없습니다.</p>
          ) : (
            <ul className="comment-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {topLevelComments.map((comment) => (
                <li key={comment.id} className="comment-item">
                  <div className="comment-item-header">
                    <span className="comment-author">{comment.author}</span>
                    <span className="comment-date">{comment.createdAt}</span>
                  </div>
                  <p className="comment-content">{comment.content}</p>
                  <div className="comment-actions">
                    <button
                      type="button"
                      className="comment-action-button"
                      onClick={() => handleCommentLike(comment.id)}
                    >
                      👍 좋아요 {comment.likes}
                    </button>
                    <button
                      type="button"
                      className="comment-action-button"
                      onClick={() => handleReplyClick(comment.id)}
                    >
                      💬 답글 달기
                    </button>
                  </div>

                  {repliesByParent.get(comment.id)?.map((reply) => (
                    <div key={reply.id} style={{ marginTop: 12, paddingLeft: 16, borderLeft: '2px solid #e5e7eb' }}>
                      <div className="comment-item-header">
                        <span className="comment-author">{reply.author}</span>
                        <span className="comment-date">{reply.createdAt}</span>
                      </div>
                      <p className="comment-content">{reply.content}</p>
                      <div className="comment-actions">
                        <button
                          type="button"
                          className="comment-action-button"
                          onClick={() => handleCommentLike(reply.id)}
                        >
                          👍 좋아요 {reply.likes}
                        </button>
                      </div>
                    </div>
                  ))}

                  {replyTargetId === comment.id && (
                    <div className="comment-reply-box">
                      <textarea
                        className="comment-reply-textarea"
                        placeholder="답글을 입력하세요"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                      />
                      <div className="comment-reply-actions">
                        <button
                          type="button"
                          className="comment-reply-cancel-button"
                          onClick={() => {
                            setReplyTargetId(null)
                            setReplyContent('')
                          }}
                        >
                          취소
                        </button>
                        <button
                          type="button"
                          className="comment-reply-submit-button"
                          onClick={handleReplySubmit}
                        >
                          답글 등록
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

        </section>
      </main>
    </div>
  )
}

export default PostDetailPage

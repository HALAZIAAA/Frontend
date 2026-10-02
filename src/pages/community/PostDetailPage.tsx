import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar'
import {
  addComment,
  deleteComment,
  deletePost,
  getPost,
  likeComment,
  likePost,
} from '../../api/communityApi'
import ReportModal from '../../components/community/ReportModal'
import { useAuth } from '../../lib/auth'
import type { Comment, PostDetail } from '../../types/community'
import type { ReportTargetType } from '../../types/report'
import '../../styles/navbar.css'
import '../../styles/community-detail.css'

function getCategoryBadgeClass(category: PostDetail['category']): string {
  if (category === '질문') return 'post-detail-category-badge question'
  if (category === '팁') return 'post-detail-category-badge tip'
  if (category === '공지') return 'post-detail-category-badge notice'
  return 'post-detail-category-badge review'
}

function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const numericId = Number(id)
  const [post, setPost] = useState<PostDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [replyTargetId, setReplyTargetId] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [reportTarget, setReportTarget] = useState<
    { type: ReportTargetType; id: number } | null
  >(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    getPost(numericId)
      .then((detail) => {
        if (!cancelled) setPost(detail)
      })
      .catch(() => {
        if (!cancelled) setPost(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
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

  // 관리자는 남의 글도 지울 수 있다. (수정은 글쓴이 본인만)
  const canModerate = user?.role === 'admin'

  // 로그인이 필요한 동작 앞에서 문지기 역할을 한다.
  const requireLogin = (): boolean => {
    if (user) return true
    alert('로그인이 필요합니다.')
    navigate('/login')
    return false
  }

  const openReport = (type: ReportTargetType, id: number) => {
    if (!requireLogin()) return
    setReportTarget({ type, id })
  }

  const handleEdit = () => {
    navigate(`/community/${id}/edit`)
  }

  const handleDelete = async () => {
    const question = post?.isMine
      ? '정말 삭제하시겠습니까?'
      : '다른 사용자의 글입니다. 관리자 권한으로 삭제할까요?'
    if (!window.confirm(question)) return

    try {
      await deletePost(numericId)
      navigate('/community')
    } catch (error) {
      alert(error instanceof Error ? error.message : '삭제에 실패했습니다.')
    }
  }

  const handlePostLike = async () => {
    if (!requireLogin() || !post) return

    try {
      const result = await likePost(numericId)
      setPost({ ...post, likes: result.likes, likedByMe: result.likedByMe })
    } catch (error) {
      alert(error instanceof Error ? error.message : '좋아요에 실패했습니다.')
    }
  }

  const handleCommentSubmit = async () => {
    if (!requireLogin()) return
    if (!newComment.trim()) {
      alert('댓글 내용을 입력해주세요.')
      return
    }

    try {
      const updated = await addComment({
        postId: numericId,
        content: newComment.trim(),
        parentId: null,
      })
      setPost(updated)
      setNewComment('')
      setShowCommentInput(false)
    } catch (error) {
      alert(error instanceof Error ? error.message : '댓글 등록에 실패했습니다.')
    }
  }

  const handleReplyClick = (commentId: number) => {
    if (!requireLogin()) return
    setReplyTargetId(commentId)
    setReplyContent('')
  }

  const handleReplySubmit = async () => {
    if (replyTargetId == null) return
    if (!requireLogin()) return
    if (!replyContent.trim()) {
      alert('답글 내용을 입력해주세요.')
      return
    }

    try {
      const updated = await addComment({
        postId: numericId,
        content: replyContent.trim(),
        parentId: replyTargetId,
      })
      setPost(updated)
      setReplyContent('')
      setReplyTargetId(null)
    } catch (error) {
      alert(error instanceof Error ? error.message : '답글 등록에 실패했습니다.')
    }
  }

  const handleCommentDelete = async (comment: Comment) => {
    const question = comment.isMine
      ? '댓글을 삭제할까요?'
      : '다른 사용자의 댓글입니다. 관리자 권한으로 삭제할까요?'
    if (!window.confirm(question)) return

    try {
      setPost(await deleteComment(comment.id))
    } catch (error) {
      alert(error instanceof Error ? error.message : '댓글 삭제에 실패했습니다.')
    }
  }

  const handleCommentLike = async (commentId: number) => {
    if (!requireLogin() || !post) return

    try {
      const result = await likeComment(commentId)
      setPost({
        ...post,
        comments: post.comments.map((comment) =>
          comment.id === commentId
            ? { ...comment, likes: result.likes, likedByMe: result.likedByMe }
            : comment,
        ),
      })
    } catch (error) {
      alert(error instanceof Error ? error.message : '좋아요에 실패했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="post-detail-page">
        <Navbar menuItems={['파일 변환', '커뮤니티', '마이페이지']} />
        <main className="post-detail-main">
          <div className="post-detail-not-found">
            <p>불러오는 중...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="post-detail-page">
        <Navbar menuItems={['파일 변환', '커뮤니티', '마이페이지']} />
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
      <Navbar menuItems={['파일 변환', '커뮤니티', '마이페이지']} />

      <main className="post-detail-main">
        <Link to="/community" className="post-detail-back-link">
          ← 목록으로
        </Link>

        <article className="post-detail-card">
          <div className="post-detail-card-header">
            <span className={getCategoryBadgeClass(post.category)}>{post.category}</span>
            {(post.isMine || canModerate) && (
              <div className="post-detail-actions">
                {post.isMine && (
                  <button
                    type="button"
                    className="post-detail-action-button edit"
                    onClick={handleEdit}
                  >
                    ✏ 수정
                  </button>
                )}
                <button
                  type="button"
                  className="post-detail-action-button delete"
                  onClick={handleDelete}
                >
                  🗑 삭제
                </button>
              </div>
            )}
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

          {post.images.length > 0 && (
            <div className="post-detail-images">
              {post.images.map((image) => (
                <img key={image.id} src={image.url} alt="첨부 이미지" loading="lazy" />
              ))}
            </div>
          )}

          <div className="post-detail-action-bar">
            <button
              type="button"
              className={`post-action-button like${post.likedByMe ? ' liked' : ''}`}
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
            {!post.isMine && (
              <button
                type="button"
                className="post-action-button report"
                onClick={() => openReport('post', post.id)}
              >
                🚩 신고
              </button>
            )}
          </div>

          {showCommentInput && (
            <div className="comment-new-box">
              <textarea
                className="comment-new-textarea"
                placeholder="댓글을 입력하세요"
                aria-label="댓글 입력"
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
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>아직 댓글이 없습니다.</p>
          ) : (
            <ul className="comment-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {topLevelComments.map((comment) => (
                <li key={comment.id} className="comment-item">
                  <div className="comment-item-header">
                    <span className="comment-author">
                      {comment.isDeleted ? '' : comment.author}
                    </span>
                    <span className="comment-date">{comment.createdAt}</span>
                  </div>
                  <p
                    className={
                      comment.isDeleted ? 'comment-content deleted' : 'comment-content'
                    }
                  >
                    {comment.content}
                  </p>
                  {!comment.isDeleted && (
                    <div className="comment-actions">
                      <button
                        type="button"
                        className={
                          comment.likedByMe
                            ? 'comment-action-button liked'
                            : 'comment-action-button'
                        }
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
                      {(comment.isMine || canModerate) && (
                        <button
                          type="button"
                          className="comment-action-button delete"
                          onClick={() => handleCommentDelete(comment)}
                        >
                          🗑 삭제
                        </button>
                      )}
                      {!comment.isMine && (
                        <button
                          type="button"
                          className="comment-action-button"
                          onClick={() => openReport('comment', comment.id)}
                        >
                          🚩 신고
                        </button>
                      )}
                    </div>
                  )}

                  {repliesByParent.get(comment.id)?.map((reply) => (
                    <div key={reply.id} style={{ marginTop: 12, paddingLeft: 16, borderLeft: '2px solid #e5e7eb' }}>
                      <div className="comment-item-header">
                        <span className="comment-author">
                          {reply.isDeleted ? '' : reply.author}
                        </span>
                        <span className="comment-date">{reply.createdAt}</span>
                      </div>
                      <p
                        className={
                          reply.isDeleted ? 'comment-content deleted' : 'comment-content'
                        }
                      >
                        {reply.content}
                      </p>
                      {!reply.isDeleted && (
                        <div className="comment-actions">
                          <button
                            type="button"
                            className={
                              reply.likedByMe
                                ? 'comment-action-button liked'
                                : 'comment-action-button'
                            }
                            onClick={() => handleCommentLike(reply.id)}
                          >
                            👍 좋아요 {reply.likes}
                          </button>
                          {(reply.isMine || canModerate) && (
                            <button
                              type="button"
                              className="comment-action-button delete"
                              onClick={() => handleCommentDelete(reply)}
                            >
                              🗑 삭제
                            </button>
                          )}
                          {!reply.isMine && (
                            <button
                              type="button"
                              className="comment-action-button"
                              onClick={() => openReport('comment', reply.id)}
                            >
                              🚩 신고
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {replyTargetId === comment.id && (
                    <div className="comment-reply-box">
                      {/* '답글 달기'를 누르면 바로 입력할 수 있게 입력칸으로 포커스를 옮긴다. */}
                      <textarea
                        className="comment-reply-textarea"
                        placeholder="답글을 입력하세요"
                        aria-label="답글 입력"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        autoFocus
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

      {reportTarget && (
        <ReportModal
          targetType={reportTarget.type}
          targetId={reportTarget.id}
          onClose={() => setReportTarget(null)}
        />
      )}
    </div>
  )
}

export default PostDetailPage

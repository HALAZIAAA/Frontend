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
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { useFeedback } from '../../lib/feedback'
import {
  ArrowLeftIcon,
  ChatCircleIcon,
  EyeIcon,
  FlagIcon,
  PencilSimpleIcon,
  PushPinIcon,
  ThumbsUpIcon,
  TrashIcon,
} from '@phosphor-icons/react'
import type { Comment, PostDetail } from '../../types/community'
import type { ReportTargetType } from '../../types/report'
import '../../styles/navbar.css'
import '../../styles/community-detail.css'
import { SkeletonList } from '../../components/common/Skeleton'

function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast, confirm } = useFeedback()

  const numericId = Number(id)
  const [post, setPost] = useState<PostDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [replyTargetId, setReplyTargetId] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState('')
  // 빈 댓글·답글 안내. 입력칸 바로 아래에 보여 준다.
  const [commentError, setCommentError] = useState('')
  const [replyError, setReplyError] = useState('')
  const [reportTarget, setReportTarget] = useState<
    { type: ReportTargetType; id: number } | null
  >(null)

  useDocumentTitle(loading ? '불러오는 중' : post ? post.title : '존재하지 않는 게시글')

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
    // 로그인 화면으로 옮긴 뒤에도 알림이 남아 왜 옮겨졌는지 알 수 있다.
    navigate('/login')
    toast('로그인이 필요합니다. 로그인한 뒤 다시 시도해 주세요.', 'info')
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
    const ok = await confirm({
      title: post?.isMine ? '이 글을 삭제할까요?' : '다른 사용자의 글입니다. 관리자 권한으로 삭제할까요?',
      message: '되돌릴 수 없습니다.',
      confirmLabel: '삭제',
      danger: true,
    })
    if (!ok) return

    try {
      await deletePost(numericId)
      navigate('/community')
      toast('글을 삭제했습니다.', 'success')
    } catch (error) {
      toast(error instanceof Error ? error.message : '삭제에 실패했습니다.', 'error')
    }
  }

  const handlePostLike = async () => {
    if (!requireLogin() || !post) return

    try {
      const result = await likePost(numericId)
      setPost({ ...post, likes: result.likes, likedByMe: result.likedByMe })
    } catch (error) {
      toast(error instanceof Error ? error.message : '좋아요에 실패했습니다.', 'error')
    }
  }

  const handleCommentSubmit = async () => {
    if (!requireLogin()) return
    if (!newComment.trim()) {
      setCommentError('댓글 내용을 입력해주세요.')
      document.getElementById('comment-new-input')?.focus()
      return
    }
    setCommentError('')

    try {
      const updated = await addComment({
        postId: numericId,
        content: newComment.trim(),
        parentId: null,
      })
      setPost(updated)
      setNewComment('')
    } catch (error) {
      toast(error instanceof Error ? error.message : '댓글 등록에 실패했습니다.', 'error')
    }
  }

  const handleReplyClick = (commentId: number) => {
    if (!requireLogin()) return
    setReplyTargetId(commentId)
    setReplyContent('')
    setReplyError('')
  }

  const handleReplySubmit = async () => {
    if (replyTargetId == null) return
    if (!requireLogin()) return
    if (!replyContent.trim()) {
      setReplyError('답글 내용을 입력해주세요.')
      document.getElementById('comment-reply-input')?.focus()
      return
    }
    setReplyError('')

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
      toast(error instanceof Error ? error.message : '답글 등록에 실패했습니다.', 'error')
    }
  }

  const handleCommentDelete = async (comment: Comment) => {
    const ok = await confirm({
      title: comment.isMine ? '이 댓글을 삭제할까요?' : '다른 사용자의 댓글입니다. 관리자 권한으로 삭제할까요?',
      message: '되돌릴 수 없습니다.',
      confirmLabel: '삭제',
      danger: true,
    })
    if (!ok) return

    try {
      setPost(await deleteComment(comment.id))
      toast('댓글을 삭제했습니다.', 'success')
    } catch (error) {
      toast(error instanceof Error ? error.message : '댓글 삭제에 실패했습니다.', 'error')
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
      toast(error instanceof Error ? error.message : '좋아요에 실패했습니다.', 'error')
    }
  }

  if (loading) {
    return (
      <div className="post-detail-page">
        <Navbar />
        <main className="page-container post-detail-main">
          <div className="post-detail-not-found">
            <SkeletonList count={1} lines={6} card label="게시글을 불러오는 중" />
          </div>
        </main>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="post-detail-page">
        <Navbar />
        <main className="page-container post-detail-main">
          <div className="post-detail-not-found">
            <h1>존재하지 않는 게시글입니다.</h1>
            <Link to="/community">목록으로</Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="post-detail-page">
      <Navbar />

      <main className="page-container post-detail-main">
        <Link to="/community" className="post-detail-back-link">
          <ArrowLeftIcon aria-hidden="true" size={18} />
          목록으로
        </Link>

        <article className="post-detail-card">
          <div className="post-detail-card-header">
            <span className={post.category === '공지' ? 'post-detail-category-badge notice' : 'post-detail-category-badge'}>
              {post.category === '공지' && <PushPinIcon aria-hidden="true" size={14} weight="fill" />}
              {post.category}
            </span>
            {(post.isMine || canModerate) && (
              <div className="post-detail-actions">
                {post.isMine && (
                  <button
                    type="button"
                    className="post-detail-action-button edit"
                    onClick={handleEdit}
                  >
                    <PencilSimpleIcon aria-hidden="true" size={18} />
                    수정
                  </button>
                )}
                <button
                  type="button"
                  className="post-detail-action-button delete"
                  onClick={handleDelete}
                >
                  <TrashIcon aria-hidden="true" size={18} />
                  삭제
                </button>
              </div>
            )}
          </div>

          <h1 className="post-detail-title">{post.title}</h1>

          <div className="post-detail-meta">
            <span>{post.author}</span>
            <span aria-hidden="true">•</span>
            <span>{post.createdAt}</span>
            <span aria-hidden="true">•</span>
            {/* 아이콘은 스크린리더가 읽지 않고, 대신 '조회 4'처럼 글자로 읽는다 */}
            <span className="post-detail-meta-stats">
              <span className="icon-stat">
                <EyeIcon aria-hidden="true" size={18} />
                <span className="sr-only">조회 </span>
                {post.views}
              </span>
              <span className="icon-stat">
                <ThumbsUpIcon aria-hidden="true" size={18} />
                <span className="sr-only">좋아요 </span>
                {post.likes}
              </span>
              <span className="icon-stat">
                <ChatCircleIcon aria-hidden="true" size={18} />
                <span className="sr-only">댓글 </span>
                {post.comments.length}
              </span>
            </span>
          </div>

          <hr className="post-detail-divider" />

          <p className="post-detail-content">{post.content}</p>

          {post.images.length > 0 && (
            <div className="post-detail-images">
              {/* 긴 이미지가 본문을 밀어내지 않게 높이를 제한하고, 누르면 원본을 새 창으로 연다. */}
              {post.images.map((image, index) => (
                <a
                  key={image.id}
                  href={image.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="post-detail-image-link"
                >
                  <img src={image.url} alt={`첨부 이미지 ${index + 1}`} loading="lazy" />
                  <span className="post-detail-image-caption">원본 보기 (새 창 열림)</span>
                </a>
              ))}
            </div>
          )}

          <div className="post-detail-action-bar">
            <button
              type="button"
              className={`post-action-button like${post.likedByMe ? ' liked' : ''}`}
              onClick={handlePostLike}
            >
              <ThumbsUpIcon aria-hidden="true" size={18} weight={post.likedByMe ? 'fill' : 'regular'} />
              좋아요 {post.likes}
            </button>
            {!post.isMine && (
              <button
                type="button"
                className="post-action-button report"
                onClick={() => openReport('post', post.id)}
              >
                <FlagIcon aria-hidden="true" size={18} />
                신고
              </button>
            )}
          </div>

        </article>

        <section className="comment-section" aria-label="댓글">
          <h2 className="comment-section-title">
            댓글 <span className="comment-count-accent">{post.comments.length}</span>
          </h2>

          {user ? (
            <div className="comment-new-box">
              <textarea
                id="comment-new-input"
                className="comment-new-textarea"
                placeholder="댓글을 입력하세요"
                aria-label="댓글 입력"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                aria-invalid={Boolean(commentError)}
                aria-describedby={commentError ? 'comment-new-error' : undefined}
              />
              {commentError && (
                <p id="comment-new-error" className="comment-input-error" role="alert">
                  {commentError}
                </p>
              )}
              <div className="comment-new-actions">
                <button type="button" className="comment-submit-button" onClick={handleCommentSubmit}>
                  댓글 등록
                </button>
              </div>
            </div>
          ) : (
            <p className="comment-login-prompt">
              <Link to="/login" className="comment-login-link">
                로그인하고 댓글 쓰기
              </Link>
            </p>
          )}

          {topLevelComments.length === 0 ? (
            <p className="comment-empty">아직 댓글이 없어요. 첫 댓글을 남겨 보세요.</p>
          ) : (
            <ul className="comment-list">
              {topLevelComments.map((comment) => (
                <li key={comment.id} className="comment-item">
                  <CommentHeader comment={comment} />
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
                        <ThumbsUpIcon aria-hidden="true" size={16} weight={comment.likedByMe ? 'fill' : 'regular'} />
                        좋아요 {comment.likes}
                      </button>
                      <button
                        type="button"
                        className="comment-action-button"
                        onClick={() => handleReplyClick(comment.id)}
                      >
                        <ChatCircleIcon aria-hidden="true" size={16} />
                        답글 달기
                      </button>
                      {(comment.isMine || canModerate) && (
                        <button
                          type="button"
                          className="comment-action-button delete"
                          onClick={() => handleCommentDelete(comment)}
                        >
                          <TrashIcon aria-hidden="true" size={16} />
                          삭제
                        </button>
                      )}
                      {!comment.isMine && (
                        <button
                          type="button"
                          className="comment-action-button"
                          onClick={() => openReport('comment', comment.id)}
                        >
                          <FlagIcon aria-hidden="true" size={16} />
                          신고
                        </button>
                      )}
                    </div>
                  )}

                  {repliesByParent.get(comment.id)?.map((reply) => (
                    <div key={reply.id} className="comment-reply-item">
                      <CommentHeader comment={reply} />
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
                            <ThumbsUpIcon aria-hidden="true" size={16} weight={reply.likedByMe ? 'fill' : 'regular'} />
                            좋아요 {reply.likes}
                          </button>
                          {(reply.isMine || canModerate) && (
                            <button
                              type="button"
                              className="comment-action-button delete"
                              onClick={() => handleCommentDelete(reply)}
                            >
                              <TrashIcon aria-hidden="true" size={16} />
                              삭제
                            </button>
                          )}
                          {!reply.isMine && (
                            <button
                              type="button"
                              className="comment-action-button"
                              onClick={() => openReport('comment', reply.id)}
                            >
                              <FlagIcon aria-hidden="true" size={16} />
                              신고
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
                        id="comment-reply-input"
                        className="comment-reply-textarea"
                        placeholder="답글을 입력하세요"
                        aria-label="답글 입력"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        aria-invalid={Boolean(replyError)}
                        aria-describedby={replyError ? 'comment-reply-error' : undefined}
                        autoFocus
                      />
                      {replyError && (
                        <p id="comment-reply-error" className="comment-input-error" role="alert">
                          {replyError}
                        </p>
                      )}
                      <div className="comment-reply-actions">
                        <button
                          type="button"
                          className="comment-reply-cancel-button"
                          onClick={() => {
                            setReplyTargetId(null)
                            setReplyContent('')
                            setReplyError('')
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

// 이름 첫 글자 동그라미는 눈으로 훑을 때 누가 쓴 댓글인지 빨리 찾게 돕는 장식이다. 스크린리더는 이름만 읽는다.
function CommentHeader({ comment }: { comment: Comment }) {
  return (
    <div className="comment-item-header">
      {!comment.isDeleted && (
        <>
          <span className="comment-avatar" aria-hidden="true">
            {comment.author.trim().charAt(0)}
          </span>
          <span className="comment-author">{comment.author}</span>
        </>
      )}
      <span className="comment-date">{comment.createdAt}</span>
    </div>
  )
}

export default PostDetailPage

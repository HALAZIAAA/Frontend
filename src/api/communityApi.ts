import { BACKEND_ORIGIN } from './fileApi'
import { formatDate, formatDateTime } from '../lib/formatDate'
import type {
  Comment,
  GetPostsParams,
  GetPostsResult,
  PostCategory,
  PostDetail,
  PostSummary,
} from '../types/community'

const API_BASE = `${BACKEND_ORIGIN}/api/v1/community`

// 백엔드는 snake_case로 준다. 변환은 이 파일 안에서만 한다.
type RawComment = {
  id: number
  author: string
  author_id: number
  content: string
  created_at: string | null
  likes: number
  liked_by_me: boolean
  is_mine: boolean
  parent_id: number | null
}

type RawPostSummary = {
  id: number
  category: string
  title: string
  preview: string
  author: string
  author_id: number
  created_at: string | null
  views: number
  likes: number
  comment_count: number
  is_hot: boolean
  liked_by_me: boolean
  is_mine: boolean
}

type RawPostDetail = RawPostSummary & {
  content: string
  comments: RawComment[]
}

type RawPostList = {
  posts: RawPostSummary[]
  total_pages: number
  current_page: number
}

type RawLike = {
  likes: number
  liked_by_me: boolean
}

export type LikeResult = {
  likes: number
  likedByMe: boolean
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { detail?: string; message?: string }
    return data.detail ?? data.message ?? `요청 실패 (${res.status})`
  } catch {
    return `요청 실패 (${res.status})`
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: init.body
      ? { 'Content-Type': 'application/json', ...(init.headers ?? {}) }
      : init.headers,
  })

  if (!res.ok) {
    throw new Error(await parseError(res))
  }
  if (res.status === 204) {
    return undefined as T
  }
  return (await res.json()) as T
}

function toSummary(raw: RawPostSummary): PostSummary {
  return {
    id: raw.id,
    category: raw.category as PostCategory,
    isHot: raw.is_hot,
    title: raw.title,
    preview: raw.preview,
    author: raw.author,
    authorId: raw.author_id,
    createdAt: formatDate(raw.created_at),
    views: raw.views,
    likes: raw.likes,
    likedByMe: raw.liked_by_me,
    isMine: raw.is_mine,
    commentCount: raw.comment_count,
  }
}

function toComment(raw: RawComment): Comment {
  return {
    id: raw.id,
    author: raw.author,
    authorId: raw.author_id,
    createdAt: formatDateTime(raw.created_at),
    content: raw.content,
    likes: raw.likes,
    likedByMe: raw.liked_by_me,
    isMine: raw.is_mine,
    parentId: raw.parent_id,
  }
}

function toDetail(raw: RawPostDetail): PostDetail {
  return {
    ...toSummary(raw),
    content: raw.content,
    comments: raw.comments.map(toComment),
  }
}

function toLikeResult(raw: RawLike): LikeResult {
  return { likes: raw.likes, likedByMe: raw.liked_by_me }
}

// 목록 조회 - 카테고리 필터, 정렬, 페이지, 검색어 지원 (페이지당 5개)
export async function getPosts(params: GetPostsParams): Promise<GetPostsResult> {
  const query = new URLSearchParams()
  query.set('category', params.category ?? '전체')
  query.set('sort', params.sort ?? 'latest')
  query.set('page', String(Math.max(1, params.page ?? 1)))

  const keyword = params.keyword?.trim()
  if (keyword) {
    query.set('keyword', keyword)
  }
  if (params.author) {
    query.set('author', params.author)
  }

  const raw = await request<RawPostList>(`/posts?${query.toString()}`)
  return {
    posts: raw.posts.map(toSummary),
    totalPages: raw.total_pages,
    currentPage: raw.current_page,
  }
}

// 단건 조회 (조회수가 1 올라간다)
export async function getPost(id: number): Promise<PostDetail> {
  return toDetail(await request<RawPostDetail>(`/posts/${id}`))
}

export async function createPost(data: {
  title: string
  category: PostCategory
  content: string
}): Promise<PostDetail> {
  return toDetail(
    await request<RawPostDetail>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  )
}

export async function updatePost(
  id: number,
  data: {
    title: string
    category: PostCategory
    content: string
  },
): Promise<PostDetail> {
  return toDetail(
    await request<RawPostDetail>(`/posts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  )
}

export async function deletePost(id: number): Promise<void> {
  await request<void>(`/posts/${id}`, { method: 'DELETE' })
}

// 좋아요는 토글이다. 이미 눌렀으면 취소된다.
export async function likePost(id: number): Promise<LikeResult> {
  return toLikeResult(await request<RawLike>(`/posts/${id}/like`, { method: 'POST' }))
}

export async function addComment(params: {
  postId: number
  content: string
  parentId?: number | null
}): Promise<PostDetail> {
  return toDetail(
    await request<RawPostDetail>(`/posts/${params.postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({
        content: params.content,
        parent_id: params.parentId ?? null,
      }),
    }),
  )
}

export async function likeComment(commentId: number): Promise<LikeResult> {
  return toLikeResult(
    await request<RawLike>(`/comments/${commentId}/like`, { method: 'POST' }),
  )
}

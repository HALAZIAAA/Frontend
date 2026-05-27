import type { Comment, GetPostsParams, GetPostsResult, Post, PostCategory } from '../types/community'

const PAGE_SIZE = 5

function computeIsHot(likes: number): boolean {
  return likes >= 20
}

function buildPreview(content: string): string {
  const trimmed = content.replace(/\s+/g, ' ').trim()
  if (trimmed.length <= 80) {
    return trimmed
  }
  return `${trimmed.slice(0, 80)}...`
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDateTime(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

let MOCK_POSTS: Post[] = [
  {
    id: 1,
    category: '질문',
    isHot: computeIsHot(24),
    title: 'PDF 변환 시 한글이 깨지는 문제 해결 방법',
    preview: 'PDF로 변환할 때 한글 폰트가 깨져서 나오는데 어떻게 해결할 수 있을까요?',
    content:
      'PDF로 변환할 때 한글 폰트가 깨져서 나오는데 어떻게 해결할 수 있을까요?\n\n여러 문서를 PDF로 변환하는 작업을 하고 있는데, 한글이 포함된 문서를 변환하면 글자가 깨지거나 다른 글자로 표시되는 문제가 발생합니다.\n\n영문은 정상적으로 변환되는데 한글만 문제가 생기네요. 어떤 설정을 확인해야 할까요?',
    author: '김민수',
    createdAt: '2026-04-10',
    views: 342,
    likes: 24,
    comments: [
      {
        id: 1,
        author: '이지은',
        createdAt: '2026-04-10 10:30',
        content:
          '한글 폰트가 임베드되지 않아서 그런 것 같습니다. 변환 옵션에서 폰트 임베드 설정을 확인해보세요.',
        likes: 5,
        parentId: null,
      },
      {
        id: 2,
        author: '박준호',
        createdAt: '2026-04-10 11:15',
        content: '저도 같은 문제가 있었는데 나눔고딕 폰트로 바꾸니 해결됐어요!',
        likes: 3,
        parentId: null,
      },
    ],
  },
  {
    id: 2,
    category: '팁',
    isHot: computeIsHot(87),
    title: '대용량 파일 변환 시 시간 단축하는 꿀팁',
    preview: '100MB 이상의 파일을 변환할 때 시간을 단축할 수 있는 방법을 공유합니다.',
    content:
      '100MB 이상의 파일을 변환할 때 시간을 단축할 수 있는 방법을 공유합니다.\n\n첫째로, 파일을 분할하여 변환하면 속도가 훨씬 빨라집니다. 둘째로, 불필요한 메타데이터를 제거하면 파일 크기를 줄일 수 있습니다.\n\n이 방법들을 조합하면 변환 시간을 최대 70%까지 단축할 수 있었습니다.',
    author: '이지은',
    createdAt: '2026-04-09',
    views: 521,
    likes: 87,
    comments: [],
  },
  {
    id: 3,
    category: '공지',
    isHot: computeIsHot(45),
    title: '새로운 파일 형식 지원 안내 (HEIC, WebP)',
    preview: 'iOS 기기에서 촬영한 HEIC 파일과 WebP 형식을 이제 지원합니다.',
    content:
      '안녕하세요, FileConverter 팀입니다.\n\n이번 업데이트를 통해 HEIC와 WebP 형식을 새롭게 지원하게 되었습니다.\n\nHEIC는 iOS 기기에서 기본으로 사용되는 이미지 형식이며, WebP는 Google이 개발한 차세대 이미지 형식입니다. 앞으로도 더 많은 형식을 지원할 예정이니 많은 이용 부탁드립니다.',
    author: '관리자',
    createdAt: '2026-04-08',
    views: 287,
    likes: 45,
    comments: [],
  },
  {
    id: 4,
    category: '팁',
    isHot: computeIsHot(31),
    title: '엑셀 파일 CSV로 변환 시 주의사항',
    preview: '특수문자나 한글이 포함된 경우 인코딩 문제가 발생할 수 있으니 주의하세요.',
    content:
      '엑셀 파일을 CSV로 변환할 때 한글이나 특수문자가 포함된 경우 인코딩 문제가 자주 발생합니다.\n\n해결 방법: 변환 시 UTF-8 인코딩을 선택하거나, EUC-KR로 저장 후 변환하면 대부분 해결됩니다.\n\n특히 쉼표(,)나 큰따옴표(")가 포함된 셀은 변환 후 반드시 확인해보세요.',
    author: '정현우',
    createdAt: '2026-04-07',
    views: 198,
    likes: 31,
    comments: [],
  },
  {
    id: 5,
    category: '질문',
    isHot: computeIsHot(12),
    title: '동영상 파일도 변환 가능한가요?',
    preview: 'MP4나 AVI 같은 동영상 파일도 변환할 수 있는지 궁금합니다.',
    content:
      '안녕하세요. 동영상 파일 변환 관련해서 질문이 있습니다.\n\nMP4나 AVI 같은 동영상 파일도 이 서비스에서 변환할 수 있나요?\n\n주로 MP4를 GIF로 변환하거나 해상도를 줄이고 싶은데 가능한지 알고 싶습니다.',
    author: '강서연',
    createdAt: '2026-04-06',
    views: 156,
    likes: 12,
    comments: [],
  },
  {
    id: 6,
    category: '후기',
    isHot: computeIsHot(54),
    title: '무료인데 광고도 없어서 좋아요',
    preview: '다른 사이트는 광고가 많은데 여기는 깔끔해서 사용하기 편합니다.',
    content:
      '파일 변환 사이트를 여러 개 써봤는데 여기가 제일 깔끔하네요.\n\n광고가 없어서 집중해서 작업할 수 있고, UI도 직관적이라 처음 써도 쉽게 이용할 수 있었습니다.\n\n앞으로도 좋은 서비스 부탁드립니다!',
    author: '윤태영',
    createdAt: '2026-04-06',
    views: 389,
    likes: 54,
    comments: [],
  },
]

// 목록 조회 - 카테고리 필터, 정렬, 페이지, 검색어 지원 (페이지당 5개)
export function getPosts(params: GetPostsParams): GetPostsResult {
  const category = params.category ?? '전체'
  const sort = params.sort ?? 'latest'
  const page = Math.max(1, params.page ?? 1)
  const keyword = params.keyword?.trim().toLowerCase() ?? ''

  let filteredPosts = MOCK_POSTS.filter((post) => {
    if (category !== '전체' && post.category !== category) {
      return false
    }

    if (!keyword) {
      return true
    }

    return [post.title, post.preview, post.content, post.author].some((field) =>
      field.toLowerCase().includes(keyword),
    )
  })

  filteredPosts = [...filteredPosts].sort((a, b) => {
    if (sort === 'popular') {
      if (b.likes !== a.likes) {
        return b.likes - a.likes
      }
      if (b.views !== a.views) {
        return b.views - a.views
      }
      return b.id - a.id
    }

    if (b.createdAt !== a.createdAt) {
      return b.createdAt.localeCompare(a.createdAt)
    }
    return b.id - a.id
  })

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const posts = filteredPosts.slice(startIndex, startIndex + PAGE_SIZE)

  return {
    posts,
    totalPages,
    currentPage,
  }
}

// 단건 조회
export function getPost(id: number): Post | undefined {
  return MOCK_POSTS.find((post) => post.id === id)
}

function findPostIndex(id: number): number {
  return MOCK_POSTS.findIndex((post) => post.id === id)
}

// 생성 - id 자동 채번, isHot 자동 계산
export function createPost(data: {
  title: string
  category: PostCategory
  content: string
  author: string
}): Post {
  const nextId = MOCK_POSTS.reduce((maxId, post) => Math.max(maxId, post.id), 0) + 1
  const likes = 0
  const newPost: Post = {
    id: nextId,
    category: data.category,
    isHot: computeIsHot(likes),
    title: data.title,
    preview: buildPreview(data.content),
    content: data.content,
    author: data.author,
    createdAt: formatDate(new Date()),
    views: 0,
    likes,
    comments: [],
  }

  MOCK_POSTS = [newPost, ...MOCK_POSTS]
  return newPost
}

// 수정
export function updatePost(
  id: number,
  data: {
    title: string
    category: PostCategory
    content: string
  },
): Post | undefined {
  const targetIndex = MOCK_POSTS.findIndex((post) => post.id === id)
  if (targetIndex === -1) {
    return undefined
  }

  const originalPost = MOCK_POSTS[targetIndex]
  const updatedPost: Post = {
    ...originalPost,
    title: data.title,
    category: data.category,
    content: data.content,
    preview: buildPreview(data.content),
    isHot: computeIsHot(originalPost.likes),
  }

  MOCK_POSTS[targetIndex] = updatedPost
  return updatedPost
}

// 삭제
export function deletePost(id: number): void {
  MOCK_POSTS = MOCK_POSTS.filter((post) => post.id !== id)
}

export function likePost(id: number): Post | undefined {
  const index = findPostIndex(id)
  if (index === -1) {
    return undefined
  }

  const target = MOCK_POSTS[index]
  const updated: Post = {
    ...target,
    likes: target.likes + 1,
    isHot: computeIsHot(target.likes + 1),
  }

  MOCK_POSTS[index] = updated
  return updated
}

function findNextCommentId(post: Post): number {
  return post.comments.reduce((maxId, comment) => Math.max(maxId, comment.id), 0) + 1
}

export function addComment(params: {
  postId: number
  content: string
  author: string
  parentId?: number | null
}): Post | undefined {
  const index = findPostIndex(params.postId)
  if (index === -1) {
    return undefined
  }

  const target = MOCK_POSTS[index]
  const nextCommentId = findNextCommentId(target)

  const newComment: Comment = {
    id: nextCommentId,
    author: params.author,
    createdAt: formatDateTime(new Date()),
    content: params.content,
    likes: 0,
    parentId: params.parentId ?? null,
  }

  const updated: Post = {
    ...target,
    comments: [...target.comments, newComment],
  }

  MOCK_POSTS[index] = updated
  return updated
}

export function likeComment(postId: number, commentId: number): Post | undefined {
  const index = findPostIndex(postId)
  if (index === -1) {
    return undefined
  }

  const target = MOCK_POSTS[index]
  const comments = target.comments.map((comment) =>
    comment.id === commentId ? { ...comment, likes: comment.likes + 1 } : comment,
  )

  const updated: Post = {
    ...target,
    comments,
  }

  MOCK_POSTS[index] = updated
  return updated
}

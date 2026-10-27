import { useState } from 'react'
import { CaretDownIcon, ChatCircleIcon } from '@phosphor-icons/react'

type Category = '공지' | '질문'

type DemoPost = {
  id: number
  category: Category
  title: string
  author: string
  body: string
  comments: Array<{ author: string; text: string }>
}

// 화면 예시용 글. 실제 커뮤니티 글이 아니다.
const POSTS: DemoPost[] = [
  {
    id: 1,
    category: '공지',
    title: '처음 오셨나요? 이용 순서 안내',
    author: '운영팀',
    body: '파일 변환 메뉴에서 PDF나 PPTX를 올리고, 변환이 끝나면 미리보기로 확인한 뒤 DOCX나 TXT로 받으세요.',
    comments: [{ author: '새내기점역사', text: '미리보기로 먼저 볼 수 있어서 좋네요.' }],
  },
  {
    id: 2,
    category: '질문',
    title: '스캔한 PDF도 변환되나요?',
    author: '점자사랑',
    body: '오래된 교재를 스캔해 둔 PDF가 있는데 이것도 되는지 궁금해요.',
    comments: [
      { author: '운영팀', text: 'PDF는 글자 인식(OCR)을 거쳐서 변환돼요. 흐리게 스캔된 페이지는 결과를 한 번 확인해 주세요.' },
    ],
  },
  {
    id: 3,
    category: '공지',
    title: '결과에 [그림 시작] 표시가 붙는 이유',
    author: '운영팀',
    body: '그림 설명이 어디서 시작하고 끝나는지 스크린리더로도 알 수 있게 표시를 붙였어요.',
    comments: [],
  },
  {
    id: 4,
    category: '질문',
    title: 'PPTX 표가 줄마다 / 로 나뉘어 나와요',
    author: '통계2학년',
    body: '표 한 줄이 "항목 / 2025년 / 2026년"처럼 나오는데 정상인가요?',
    comments: [{ author: '운영팀', text: '네, 표의 칸을 / 로 나눠 한 줄씩 읽을 수 있게 만든 거예요.' }],
  },
]

const FILTERS: Array<Category | '전체'> = ['전체', '공지', '질문']

function CommunityDemo() {
  const [filter, setFilter] = useState<Category | '전체'>('전체')
  const [openId, setOpenId] = useState<number | null>(null)
  const visiblePosts = filter === '전체' ? POSTS : POSTS.filter((post) => post.category === filter)

  return (
    <div className="demo-community">
      <div className="demo-chip-row" role="group" aria-label="글 종류">
        {FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            className="demo-chip"
            aria-pressed={filter === item}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <ul className="demo-post-list" role="list">
        {visiblePosts.map((post) => {
          const isOpen = openId === post.id
          return (
            <li key={post.id} className="demo-post">
              <button
                type="button"
                className="demo-post-head"
                aria-expanded={isOpen}
                aria-controls={`demo-post-${post.id}`}
                onClick={() => setOpenId(isOpen ? null : post.id)}
              >
                <span className={`demo-badge ${post.category === '공지' ? 'is-notice' : 'is-question'}`}>
                  {post.category}
                </span>
                <span className="demo-post-title">{post.title}</span>
                <span className="demo-post-count">
                  <ChatCircleIcon aria-hidden="true" size={16} />
                  <span className="sr-only">댓글</span>
                  {post.comments.length}
                </span>
                <CaretDownIcon aria-hidden="true" size={16} className="demo-post-caret" />
              </button>
              <div id={`demo-post-${post.id}`} className="demo-post-body" hidden={!isOpen}>
                <p className="demo-subtle">작성자 {post.author}</p>
                <p className="demo-post-text">{post.body}</p>
                {post.comments.map((comment) => (
                  <p key={comment.text} className="demo-comment">
                    <strong>{comment.author}</strong> {comment.text}
                  </p>
                ))}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default CommunityDemo

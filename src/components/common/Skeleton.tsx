// 불러오는 동안 실제 목록과 비슷한 모양의 회색 틀을 보여준다.
// 회색 틀은 스크린리더에 숨기고, '불러오는 중' 문장만 읽게 한다.

type SkeletonListProps = {
  // 몇 줄짜리 항목을 몇 개 그릴지
  count?: number
  lines?: number
  // 항목마다 테두리 카드로 감쌀지 (커뮤니티 글 카드처럼)
  card?: boolean
  label?: string
}

const LINE_WIDTHS = ['40%', '85%', '60%', '75%']

export function SkeletonList({ count = 3, lines = 3, card = false, label = '불러오는 중' }: SkeletonListProps) {
  return (
    <div className="skeleton-list" aria-busy="true">
      <span className="sr-only">{label}</span>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={card ? 'skeleton-item card' : 'skeleton-item'} aria-hidden="true">
          {Array.from({ length: lines }, (_, line) => (
            <span
              key={line}
              className="skeleton skeleton-line"
              style={{ width: LINE_WIDTHS[line % LINE_WIDTHS.length], height: line === 0 ? '1.1rem' : '0.85rem' }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
